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
    '197398f4-3cd2-448f-b659-00f777fc8eec', // aitougnaounadia@hmail.com
    '8f2dc9d5-ac72-4986-be86-6ce84f24ae79', // testlovable2026@yopmail.com
    '609a518b-b014-457b-a64e-adf1854a685a', // mactar.coran@gmail
    '2d880e35-9fe8-448d-836d-55c7818ab2fa', // rahma.benyedir2ga@gmail.clm
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
