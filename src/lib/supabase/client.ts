import { getSupabaseEnv } from "./env";
import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  const { url, anonKey } = getSupabaseEnv();
  // App Router (browser client): uses localStorage session persistence by default.
  browserClient = createBrowserClient(url, anonKey, {
    global: { fetch },
  });
  return browserClient;
}

