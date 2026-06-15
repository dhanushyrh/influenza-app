// Supabase clients — browser, server (RLS via user session), and admin (service role).
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
// next/headers is imported lazily inside serverClient() so this module stays
// importable from client components (e.g. Wizard.tsx uses browserClient only).

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Client component / browser usage.
export function browserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

// Server component / route handler usage — carries the user's session cookie,
// so all reads are subject to RLS as that user.
export function serverClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { cookies } = require("next/headers") as typeof import("next/headers");
  const store = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component where cookies are read-only — ignore.
        }
      },
    },
  });
}

// Server-only admin client (bypasses RLS). Use for invite-token validation,
// cron metric refresh, escrow writes. NEVER import into client components.
export function adminClient() {
  if (!SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
