import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const fakeUserIds = [
    '197398f4-b1a0-4c8e-8e1a-1b2c3d4e5f6a', // aitougnaounadia@hmail.com
    '8f2dc9d5-a1b2-4c3d-8e4f-5a6b7c8d9e0f', // testlovable2026@yopmail.com
    '609a518b-1a2b-3c4d-5e6f-7a8b9c0d1e2f', // mactar.coran@gmail
    '2d880e35-a1b2-3c4d-5e6f-7a8b9c0d1e2f', // rahma.benyedir2ga@gmail.clm
  ];

  const results = [];

  for (const uid of fakeUserIds) {
    const { error } = await supabase.auth.admin.deleteUser(uid);
    results.push({ uid, error: error?.message || null, success: !error });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
