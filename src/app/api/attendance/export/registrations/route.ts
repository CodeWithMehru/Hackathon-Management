import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/utils/csv";
import type { AttendanceLogs } from "@/lib/types/attendance";

const istFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

function hasSessionActivity(
  logs: AttendanceLogs | null | undefined,
  session: string
): boolean {
  if (!logs || typeof logs !== "object") return false;
  const s = logs[session];
  if (!s || typeof s !== "object") return false;
  const ci = s.checkin;
  const co = s.checkout;
  return Boolean(
    (typeof ci === "string" && ci.length > 0) ||
      (typeof co === "string" && co.length > 0)
  );
}

function formatIstTimestamp(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return istFormatter.format(date);
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const session = searchParams.get("session")?.trim() ?? "";

  if (!session) {
    return NextResponse.json(
      { error: "Missing session query parameter" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("Hackathon_Attendance")
    .select("name,email,college,semester,phone_number,roll_number,attendance_logs")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? [])
    .filter((row) =>
      hasSessionActivity(row.attendance_logs as AttendanceLogs, session)
    )
    .map((row) => {
      const logs = (row.attendance_logs as AttendanceLogs)?.[session] ?? {};
      return {
        Name: row.name,
        Email: row.email,
        Institution: row.college ?? "",
        Semester: row.semester ?? "",
        "Phone Number": row.phone_number ?? "",
        "Check-in Time": formatIstTimestamp(logs.checkin),
        "Check-out Time": formatIstTimestamp(logs.checkout),
        "Roll Number": row.roll_number ?? "",
      };
    });

  const headers = [
    "Name",
    "Email",
    "Institution",
    "Semester",
    "Phone Number",
    "Check-in Time",
    "Check-out Time",
    "Roll Number",
  ];
  const csv = toCsv(headers, rows as Array<Record<string, unknown>>);

  const safeName = session.replace(/[^\w\-]+/g, "_").slice(0, 80) || "export";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${safeName}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
