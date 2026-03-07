import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const userIds = [
    '525f732f-da54-4c13-8b92-c5bae49fbec5', // test@gmail.com
    '6679fb4d-0b40-494a-8988-56fbba2001ab', // testoooooo@gmail.com
  ];

  const results = [];
  for (const id of userIds) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    results.push({ id, error: error?.message || null });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
