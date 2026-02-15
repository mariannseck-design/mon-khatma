import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base64url encode/decode helpers for Web Push
function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64url(arr: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importVapidKey(pem: string): Promise<CryptoKey> {
  // VAPID private key is a raw 32-byte key in base64url
  const keyData = base64urlToUint8Array(pem);
  return await crypto.subtle.importKey(
    'pkcs8',
    await pemToArrayBuffer(pem),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

// For raw base64url VAPID keys (standard web-push format)
async function importRawVapidPrivateKey(base64urlKey: string): Promise<CryptoKey> {
  const rawKey = base64urlToUint8Array(base64urlKey);
  
  // Build PKCS8 from raw 32-byte private key for P-256
  // PKCS8 header for P-256 EC key
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20
  ]);
  const pkcs8Footer = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00
  ]);
  
  // We only need the private key portion for signing
  const pkcs8 = new Uint8Array(pkcs8Header.length + rawKey.length);
  pkcs8.set(pkcs8Header);
  pkcs8.set(rawKey, pkcs8Header.length);

  return await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  ).catch(async () => {
    // Fallback: try JWK import
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      d: base64urlKey,
      x: '', // Will be derived
      y: '',
    };
    // If raw import fails, we'll use a simpler approach
    throw new Error('Raw key import not supported, using JWT-based auth');
  });
}

async function pemToArrayBuffer(pem: string): Promise<ArrayBuffer> {
  const raw = base64urlToUint8Array(pem);
  return raw.buffer;
}

// Simple JWT creation for VAPID
async function createVapidJWT(audience: string, subject: string, vapidPrivateKey: string, vapidPublicKey: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key for signing
  const rawKey = base64urlToUint8Array(vapidPrivateKey);
  
  // Build PKCS8 wrapper for the raw key
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20
  ]);

  const pkcs8 = new Uint8Array(pkcs8Header.length + rawKey.length);
  pkcs8.set(pkcs8Header);
  pkcs8.set(rawKey, pkcs8Header.length);

  try {
    const key = await crypto.subtle.importKey(
      'pkcs8',
      pkcs8.buffer,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      encoder.encode(unsignedToken)
    );

    const sigB64 = uint8ArrayToBase64url(new Uint8Array(signature));
    return `${unsignedToken}.${sigB64}`;
  } catch {
    // If PKCS8 fails, skip VAPID JWT signing - notifications will use basic auth
    console.error('VAPID JWT signing failed, using basic push');
    throw new Error('VAPID signing not available');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const currentDay = now.getDay();
    const currentHH = String(now.getHours()).padStart(2, '0');
    const currentMM = String(now.getMinutes()).padStart(2, '0');
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Fetch enabled reminders for today's day of week
    const { data: reminders, error: remErr } = await supabase
      .from('reading_reminders')
      .select('*')
      .eq('is_enabled', true)
      .contains('days_of_week', [currentDay]);

    if (remErr) {
      console.error('Error fetching reminders:', remErr);
      return new Response(JSON.stringify({ error: remErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let sentCount = 0;

    for (const reminder of reminders) {
      const [tH, tM] = reminder.reminder_time.slice(0, 5).split(':').map(Number);
      const targetMinutes = tH * 60 + tM;

      // Only send if within ±1 minute window
      if (Math.abs(currentMinutes - targetMinutes) > 1) continue;

      // Get push subscriptions for this user
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', reminder.user_id);

      if (!subs || subs.length === 0) continue;

      const payload = JSON.stringify({
        title: '🌙 Rappel Makhatma',
        body: reminder.message || "Assalamou aleykoum ! C'est le moment de ta lecture pour rester régulière avec le Livre d'Allah (عز وجل). Prête pour tes pages du jour ?",
        icon: '/favicon.png',
        url: '/accueil',
      });

      for (const sub of subs) {
        try {
          // Simple push without VAPID JWT if keys not available
          const pushEndpoint = sub.endpoint;
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'TTL': '86400',
          };

          if (vapidPublicKey && vapidPrivateKey) {
            try {
              const endpointUrl = new URL(pushEndpoint);
              const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;
              const jwt = await createVapidJWT(audience, 'mailto:contact@makhatma.app', vapidPrivateKey, vapidPublicKey);
              headers['Authorization'] = `vapid t=${jwt}, k=${vapidPublicKey}`;
            } catch {
              console.log('VAPID auth skipped, using basic push');
            }
          }

          const pushRes = await fetch(pushEndpoint, {
            method: 'POST',
            headers,
            body: payload,
          });

          if (pushRes.status === 201 || pushRes.status === 200) {
            sentCount++;
          } else if (pushRes.status === 410 || pushRes.status === 404) {
            // Subscription expired, remove it
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          } else {
            console.error(`Push failed for ${sub.id}: ${pushRes.status}`);
          }
        } catch (err) {
          console.error(`Error sending push to ${sub.id}:`, err);
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Push notifications processed', sent: sentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
