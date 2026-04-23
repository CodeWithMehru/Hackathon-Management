import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const { name, email, college, semester, phone_number, roll_number } = body || {};

    if (!name || !email || !college || !semester) {
      return NextResponse.json({ error: "Name, email, institution, and semester are required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await adminSupabase
      .from("Hackathon_Attendance")
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          college: college.trim(),
          semester: semester.trim(),
          phone_number: phone_number ? phone_number.trim() : null,
          roll_number: roll_number ? roll_number.trim() : null,
          status: "Registered",
        },
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Attendee added successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
