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

const batches: Record<number, string[]> = {
  1: ["profiles", "allowed_emails", "user_roles", "sisters_circles", "quran_goals", "hifz_goals", "notification_preferences", "push_subscriptions", "reading_reminders"],
  2: ["quran_progress", "hifz_sessions", "hifz_memorized_verses", "hifz_streaks", "mourad_sessions", "muraja_sessions", "khatma_completions"],
  3: ["circle_members", "circle_messages", "circle_message_likes", "favorite_verses"],
  4: ["challenge_baqara", "challenge_kahf", "challenge_mulk", "mood_entries", "ramadan_reading_goals", "ramadan_daily_tasks", "ramadan_dhikr_entries", "ramadan_reviews", "ramadan_weekly_reports"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const batchParam = url.searchParams.get("batch");
    const batchNum = batchParam ? parseInt(batchParam, 10) : 0;

    if (!batchNum || !batches[batchNum]) {
      return new Response(
        `Utilisation : ?batch=1, ?batch=2, ?batch=3 ou ?batch=4\n\nBatch 1: ${batches[1].join(", ")}\nBatch 2: ${batches[2].join(", ")}\nBatch 3: ${batches[3].join(", ")}\nBatch 4: ${batches[4].join(", ")}`,
        { headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const tables = batches[batchNum];

    const sqlParts: string[] = [
      `-- ==========================================`,
      `-- EXPORT BATCH ${batchNum}/4 - Ma Khatma`,
      `-- Tables: ${tables.join(", ")}`,
      `-- Généré le ${new Date().toISOString()}`,
      `-- ==========================================`,
      "",
    ];

    for (const table of tables) {
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
