import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeSQL(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    // If array contains objects, treat as jsonb
    const hasObjects = val.some((v) => typeof v === "object" && v !== null);
    if (hasObjects) {
      return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    }
    // PostgreSQL array literal for primitives
    const items = val.map((v) => {
      if (typeof v === "string") return `"${v.replace(/"/g, '\\"')}"`;
      return String(v);
    });
    return `'{${items.join(",")}}'`;
  }
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  // String
  return `'${String(val).replace(/'/g, "''")}'`;
}

function generateInserts(tableName: string, rows: Record<string, unknown>[]): string {
  if (!rows || rows.length === 0) return `-- ${tableName}: no data\n`;

  const columns = Object.keys(rows[0]);
  const lines: string[] = [];
  lines.push(`-- === ${tableName} (${rows.length} rows) ===`);

  for (const row of rows) {
    const values = columns.map((col) => escapeSQL(row[col]));
    lines.push(
      `INSERT INTO public.${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT DO NOTHING;`
    );
  }

  lines.push("");
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const tableOrder = [
      // Step 1: Core
      "profiles",
      "allowed_emails",
      "user_roles",
      // Step 2: Structures
      "sisters_circles",
      // Step 3: Config
      "quran_goals",
      "hifz_goals",
      "notification_preferences",
      "push_subscriptions",
      "reading_reminders",
      // Step 4: Activity
      "quran_progress",
      "hifz_sessions",
      "hifz_memorized_verses",
      "hifz_streaks",
      "mourad_sessions",
      "muraja_sessions",
      "khatma_completions",
      // Step 5: Social
      "circle_members",
      "circle_messages",
      "circle_message_likes",
      "favorite_verses",
      // Step 6: Challenges & Ramadan & Misc
      "challenge_baqara",
      "challenge_kahf",
      "challenge_mulk",
      "mood_entries",
      "ramadan_reading_goals",
      "ramadan_daily_tasks",
      "ramadan_dhikr_entries",
      "ramadan_reviews",
      "ramadan_weekly_reports",
    ];

    const sqlParts: string[] = [
      "-- ==========================================",
      "-- EXPORT COMPLET - Ma Khatma",
      "-- Généré le " + new Date().toISOString(),
      "-- Exécuter dans Run SQL côté LIVE",
      "-- ==========================================",
      "",
    ];

    for (const table of tableOrder) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select("*")
        .limit(10000);

      if (error) {
        sqlParts.push(`-- ERROR on ${table}: ${error.message}`);
        continue;
      }

      sqlParts.push(generateInserts(table, data || []));
    }

    const fullSQL = sqlParts.join("\n");

    return new Response(fullSQL, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
