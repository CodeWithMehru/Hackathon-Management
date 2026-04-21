import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Delete all rows in Hackathon_Attendance (authenticated organizers only).
 *
 * If DELETE returns 401/permission errors, enable RLS delete for authenticated:
 *
 * create policy "organizers_delete"
 * on public."Hackathon_Attendance"
 * for delete
 * to authenticated
 * using (true);
 */
export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // PostgREST requires a filter; delete all rows with a real UUID.
    const { error } = await supabase
      .from("Hackathon_Attendance")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("[attendance/all] delete_failed", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[attendance/all] unhandled", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
