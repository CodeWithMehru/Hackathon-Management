import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AttendanceLogs, ManageAction } from "@/lib/types/attendance";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | { id: string; action: ManageAction; session: string }
      | null;

    const id = body?.id;
    const action = body?.action;
    const session = body?.session?.trim() ?? "";

    if (!id || !action || (action !== "CHECKIN" && action !== "CHECKOUT")) {
      return NextResponse.json(
        { error: "Missing id, action, or invalid action" },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "Missing or empty session name" },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from("Hackathon_Attendance")
      .select("attendance_logs")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: fetchError?.message ?? "Row not found" },
        { status: fetchError ? 500 : 404 }
      );
    }

    const now = new Date().toISOString();
    const prev =
      (existing.attendance_logs as AttendanceLogs | null | undefined) ?? {};
    const nextLogs: AttendanceLogs = { ...prev };
    const prevSession = nextLogs[session] ?? {};
    nextLogs[session] =
      action === "CHECKIN"
        ? { ...prevSession, checkin: now }
        : { ...prevSession, checkout: now };

    const status =
      action === "CHECKIN" ? ("Checked In" as const) : ("Checked Out" as const);

    const { data, error } = await supabase
      .from("Hackathon_Attendance")
      .update({
        attendance_logs: nextLogs,
        status,
      })
      .eq("id", id)
      .select("id,name,email,status,attendance_logs")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ row: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
