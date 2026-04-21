import { ThemeIdeaPoolManager } from "@/components/ThemeIdeaPoolManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getIdeaPoolStats() {
  const supabase = await createSupabaseServerClient();

  const { count: totalIdeas } = await supabase
    .from("Theme_Ideas")
    .select("*", { count: "exact", head: true });

  const { count: remainingUntakenIdeas } = await supabase
    .from("Theme_Ideas")
    .select("*", { count: "exact", head: true })
    .eq("is_taken", false);

  // If table lacks created_at, ordering by id gives a practical latest hint.
  const { data: latestThemeRow } = await supabase
    .from("Theme_Ideas")
    .select("theme_name")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    totalIdeas: totalIdeas ?? 0,
    remainingUntakenIdeas: remainingUntakenIdeas ?? 0,
    lastGeneratedTheme: latestThemeRow?.theme_name ?? "—",
  };
}

export default async function ThemeManagerPage() {
  const ideaPoolStats = await getIdeaPoolStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
          Theme & Idea Management
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage your idea pool, generate new themes, and view pool status.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Idea Pool Status</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Live summary for Claim & Lock idea inventory.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Total Ideas
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">
              {ideaPoolStats.totalIdeas}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Remaining Untaken Ideas
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">
              {ideaPoolStats.remainingUntakenIdeas}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Last Generated Theme
            </p>
            <p className="mt-1 truncate text-base font-semibold text-zinc-900">
              {ideaPoolStats.lastGeneratedTheme}
            </p>
          </div>
        </div>
      </section>

      <ThemeIdeaPoolManager />
    </div>
  );
}
