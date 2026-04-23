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
      | { id: string; action: ManageAction; session: string; roll_number?: string }
      | null;

    const id = body?.id;
    const action = body?.action;
    const session = body?.session?.trim() ?? "";
    const roll_number = body?.roll_number?.trim();

    if (!id || !action || (action !== "CHECKIN" && action !== "CHECKOUT" && action !== "UNDO")) {
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
    
    if (action === "CHECKIN") {
      nextLogs[session] = { ...prevSession, checkin: now, checkout: null };
    } else if (action === "CHECKOUT") {
      nextLogs[session] = { ...prevSession, checkout: now };
    } else if (action === "UNDO") {
      nextLogs[session] = { ...prevSession, checkin: null, checkout: null };
    }

    const status =
      action === "CHECKIN"
        ? ("Checked In" as const)
        : action === "CHECKOUT"
        ? ("Checked Out" as const)
        : ("Registered" as const);

    const updatePayload: any = {
      attendance_logs: nextLogs,
      status,
    };
    
    if (roll_number !== undefined) {
      updatePayload.roll_number = roll_number;
    }

    const { data, error } = await supabase
      .from("Hackathon_Attendance")
      .update(updatePayload)
      .eq("id", id)
      .select("id,name,email,phone_number,college,semester,roll_number,status,attendance_logs")
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
