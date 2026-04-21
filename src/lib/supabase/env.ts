export function getSupabaseEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !anonKey) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  const url = rawUrl.trim().replace(/\/+$/, "");

  if (!/^https:\/\/.+/i.test(url)) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL: "${rawUrl}". It must start with "https://".`
    );
  }

  if (!anonKey.trim()) {
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY: empty value.");
  }

  return { url, anonKey: anonKey.trim() };
}

