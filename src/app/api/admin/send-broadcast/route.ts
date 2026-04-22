import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null) as {
      subject: string;
      message: string;
    } | null;

    if (!body?.subject || !body?.message) {
      return NextResponse.json(
        { error: "Subject and message are required." },
        { status: 400 }
      );
    }

    const { subject, message } = body;

    const { data: attendees, error } = await supabase
      .from("Hackathon_Attendance")
      .select("email");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emails = (attendees || []).map((row) => row.email).filter(Boolean);

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "No attendees found to broadcast to." },
        { status: 404 }
      );
    }

    const userEmail = process.env.GMAIL_USER;
    const userPass = process.env.GMAIL_APP_PASSWORD;

    if (!userEmail || !userPass) {
      return NextResponse.json(
        { error: "Email credentials not configured on the server." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: userEmail,
        pass: userPass,
      },
    });

    await transporter.sendMail({
      from: `"Hack Desk" <${userEmail}>`,
      to: userEmail,
      bcc: emails,
      subject: subject,
      text: message, // Use plain text for standard messaging, or html if you want
    });

    return NextResponse.json({ success: true, count: emails.length });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
