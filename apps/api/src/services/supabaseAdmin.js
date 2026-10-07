import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in apps/api/.env — see .env.example.'
  );
}

// Service-role key bypasses RLS entirely. This client must NEVER be sent
// to the browser and every query built with it must be manually scoped
// to the caller's business_id (resolved from their verified JWT) — see
// middleware/auth.js and services/ai/tools/*.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
