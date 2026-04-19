import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client-side Supabase instance (anon key, session persisted in localStorage). */
export const supabaseBrowser = () => createClient(url, anon);

/** Server-side Supabase instance (service role key, no session persistence). */
export const supabaseServer = () => {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, service, {
    auth: { persistSession: false },
  });
};
