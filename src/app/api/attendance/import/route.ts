import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Row = { name: string; email: string };

function logSupabaseError(context: string, error: unknown) {
  // Supabase errors usually include: message, code, details, hint
  console.error(`[attendance/import] ${context}`, error);
}

function cleanEmail(input: unknown) {
  const email = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/^mailto:/, "");
  if (!email || !email.includes("@")) return null;
  const [local, domain] = email.split("@");
  if (!local || !domain || !domain.includes(".")) return null;
  return email;
}

function cleanName(input: unknown, fallbackEmail: string) {
  const name = String(input ?? "").trim().replace(/\s+/g, " ");
  if (name) return name;
  const base = fallbackEmail.split("@")[0]?.trim();
  return base ? base : "Participant";
}

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
      | { rows: Row[] }
      | null;

    const rows = body?.rows ?? [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    // Strict contract: backend only accepts {name,email}. Still validate + sanitize here.
    const cleaned: Array<{ name: string; email: string; status: "Registered" }> =
      [];

    const seen = new Set<string>();
    for (const r of rows) {
      const email = cleanEmail((r as Row | undefined)?.email);
      if (!email) continue; // skip invalid rows, don't fail whole upload
      if (seen.has(email)) continue;
      seen.add(email);

      const name = cleanName((r as Row | undefined)?.name, email);
      cleaned.push({ name, email, status: "Registered" });
      if (cleaned.length >= 5000) break;
    }

    if (cleaned.length === 0) {
      return NextResponse.json(
        { error: "No valid rows (missing emails)" },
        { status: 400 }
      );
    }

    // Upsert by email requires a UNIQUE index/constraint on email (recommended in plan SQL).
    const { data, error } = await supabase
      .from("Hackathon_Attendance")
      .upsert(cleaned, { onConflict: "email" })
      .select("id");

    if (error) {
      logSupabaseError("upsert_failed", {
        message: (error as any)?.message,
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        raw: error,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      imported: cleaned.length,
      upserted: data?.length ?? 0,
    });
  } catch (e) {
    logSupabaseError("unhandled_exception", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

