import { StatCard } from "@/components/StatCard";
import { UploadCsvCard } from "@/components/UploadCsvCard";
import { ResetAllDataButton } from "@/components/ResetAllDataButton";
import { BroadcastMessageButton } from "@/components/BroadcastMessageButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = await createSupabaseServerClient();

  const { count: totalRegistrations } = await supabase
    .from("Hackathon_Attendance")
    .select("*", { count: "exact", head: true });

  const { count: totalCheckins } = await supabase
    .from("Hackathon_Attendance")
    .select("*", { count: "exact", head: true })
    .eq("status", "Checked In");

  return {
    totalRegistrations: totalRegistrations ?? 0,
    totalCheckins: totalCheckins ?? 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  const hasData = stats.totalRegistrations > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Import registrations and define the current session name for check-in.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BroadcastMessageButton />
          <ResetAllDataButton />
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-zinc-700">
            No data yet. Upload a CSV and set the name of the event registration
            session.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard
            label="Total Registrations"
            value={stats.totalRegistrations}
            hint="All imported participants"
          />
          <StatCard
            label="Total Check-ins"
            value={stats.totalCheckins}
            hint="Currently checked in (status)"
            className="border-blue-200"
          />
        </div>
      )}

      <UploadCsvCard />
    </div>
  );
}
