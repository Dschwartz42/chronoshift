import { createClient } from "@supabase/supabase-js";

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

// Named export for client-side use — safe only in browser context
export const supabase = {
  channel: (...args: Parameters<ReturnType<typeof createClient>["channel"]>) =>
    getSupabase().channel(...args),
  removeChannel: (...args: Parameters<ReturnType<typeof createClient>["removeChannel"]>) =>
    getSupabase().removeChannel(...args),
};

export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
