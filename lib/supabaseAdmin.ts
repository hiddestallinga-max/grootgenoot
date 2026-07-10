import { createClient } from "@supabase/supabase-js";

// Server-only Supabase-client met de service role key.
// Deze key omzeilt Row Level Security en mag NOOIT in de browser komen.
// Wordt daarom alleen geïmporteerd in server components en route handlers.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Ontbrekende env-variabelen: NEXT_PUBLIC_SUPABASE_URL en/of SUPABASE_SERVICE_ROLE_KEY. Zie .env.example.",
  );
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
