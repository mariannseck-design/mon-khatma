import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

/**
 * Create a VAPID JWT using JWK import (Web Crypto compatible).
 * The VAPID public key is an uncompressed EC P-256 point (65 bytes: 0x04 || x[32] || y[32]).
 * The private key is a raw 32-byte scalar.
 */
async function createVapidJWT(
  audience: string,
  subject: string,
  vapidPrivateKeyB64: string,
  vapidPublicKeyB64: string
): Promise<string> {
  const pubBytes = base64urlToUint8Array(vapidPublicKeyB64);
  // Uncompressed point: first byte is 0x04, then 32 bytes x, 32 bytes y
  if (pubBytes.length !== 65 || pubBytes[0] !== 0x04) {
    throw new Error(`Invalid VAPID public key length: ${pubBytes.length}`);
  }
  const x = uint8ArrayToBase64url(pubBytes.slice(1, 33));
  const y = uint8ArrayToBase64url(pubBytes.slice(33, 65));

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: vapidPrivateKeyB64,
    x,
    y,
  };

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const encoder = new TextEncoder();
  const headerB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      encoder.encode(unsignedToken)
    )
  );

  // ECDSA signature from Web Crypto is in IEEE P1363 format (r || s, 64 bytes) — perfect for JWT ES256
  return `${unsignedToken}.${uint8ArrayToBase64url(signature)}`;
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

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(JSON.stringify({ error: 'VAPID keys missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Fetch enabled reminders for today
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
    const errors: string[] = [];

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

      if (!subs || subs.length === 0) {
        console.log(`No subscriptions for user ${reminder.user_id}`);
        continue;
      }

      for (const sub of subs) {
        try {
          const pushEndpoint = sub.endpoint;
          const endpointUrl = new URL(pushEndpoint);
          const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

          const jwt = await createVapidJWT(
            audience,
            'mailto:contact@makhatma.app',
            vapidPrivateKey,
            vapidPublicKey
          );

          // Send push WITHOUT payload to avoid encryption complexity.
          // The Service Worker will show a default spiritual message.
          const pushRes = await fetch(pushEndpoint, {
            method: 'POST',
            headers: {
              'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
              'TTL': '86400',
              'Content-Length': '0',
            },
          });

          if (pushRes.status === 201 || pushRes.status === 200) {
            sentCount++;
            console.log(`Push sent to ${sub.id}`);
          } else if (pushRes.status === 410 || pushRes.status === 404) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            console.log(`Removed expired subscription ${sub.id}`);
          } else {
            const body = await pushRes.text();
            const msg = `Push failed for ${sub.id}: ${pushRes.status} - ${body}`;
            console.error(msg);
            errors.push(msg);
          }
        } catch (err) {
          const msg = `Error sending push to ${sub.id}: ${err}`;
          console.error(msg);
          errors.push(msg);
        }
      }
    }

    return new Response(JSON.stringify({
      message: 'Push notifications processed',
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    }), {
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
