import { createSupabaseServerClient } from "@/lib/supabase/server";
import RegistrationsClient from "./registrations-client";
import type { HackathonAttendanceRow } from "@/lib/types/attendance";

export const dynamic = "force-dynamic";

async function getParticipants(): Promise<HackathonAttendanceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("Hackathon_Attendance")
    .select("id,name,email,college,semester,roll_number,phone_number,status,attendance_logs")
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []).map((row) => ({
    ...row,
    attendance_logs:
      (row.attendance_logs as HackathonAttendanceRow["attendance_logs"]) ?? {},
  })) as HackathonAttendanceRow[];
}

export default async function RegistrationsPage() {
  const participants = await getParticipants();

  return <RegistrationsClient initialParticipants={participants} />;
}
