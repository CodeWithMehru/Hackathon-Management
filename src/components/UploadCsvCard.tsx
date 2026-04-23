"use client";

import Papa from "papaparse";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getActiveSession, setActiveSession } from "@/lib/active-session";

type ParsedRegistrant = { name: string; email: string; phone_number?: string; college?: string; semester?: string };

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreHeader(header: string, kind: "email" | "name" | "phone" | "college" | "semester") {
  const h = normalizeHeader(header);
  if (kind === "email") {
    if (!h.includes("email")) return -1;
  } else if (kind === "name") {
    if (!h.includes("name")) return -1;
    if (h.includes("email")) return 1;
  } else if (kind === "phone") {
    if (!h.includes("phone") && !h.includes("mobile") && !h.includes("whatsapp")) return -1;
  } else if (kind === "college") {
    if (!h.includes("college") && !h.includes("institution") && !h.includes("university")) return -1;
  } else if (kind === "semester") {
    if (!h.includes("semester") && !h.includes("term")) return -1;
  }

  let score = 10;
  if (kind === "email") {
    if (h === "email") score += 50;
    if (h.includes("address")) score += 8;
    if (h.includes("id")) score += 6;
    if (h.includes("participant")) score += 4;
    if (h.includes("primary")) score += 3;
  } else if (kind === "name") {
    if (h === "name") score += 40;
    if (h.includes("full")) score += 10;
    if (h.includes("participant")) score += 4;
    if (h.includes("first")) score += 2;
    if (h.includes("last")) score += 2;
  } else if (kind === "phone") {
    if (h.includes("whatsapp")) score += 10;
    if (h.includes("mobile")) score += 5;
    if (h.includes("phone")) score += 5;
  } else if (kind === "college") {
    if (h.includes("institution")) score += 15;
    if (h.includes("college")) score += 10;
    if (h.includes("university")) score += 5;
  } else if (kind === "semester") {
    if (h.includes("semester")) score += 20;
    if (h.includes("term")) score += 5;
  }

  if (h.includes("timestamp")) score -= 4;

  return score;
}

function pickFuzzyColumn(headers: string[], kind: "email" | "name" | "phone" | "college" | "semester") {
  let best: { header: string; score: number } | null = null;
  for (const header of headers) {
    const score = scoreHeader(header, kind);
    if (score < 0) continue;
    if (!best || score > best.score) best = { header, score };
  }
  return best?.header ?? null;
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

function parseCsvText(
  text: string
): { rows: ParsedRegistrant[]; warnings: string[] } {
  const warnings: string[] = [];
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''),
  });

  if (parsed.errors?.length) {
    warnings.push(
      ...parsed.errors
        .slice(0, 3)
        .map((e: { message?: string }) => e.message ?? "CSV parse error")
    );
  }

  const headers = parsed.meta.fields ?? [];
  if (!headers.length) {
    return { rows: [], warnings: ["No CSV headers detected."] };
  }

  const emailKey = pickFuzzyColumn(headers, "email");
  const nameKey = pickFuzzyColumn(headers, "name");
  const phoneKey = pickFuzzyColumn(headers, "phone");
  const collegeKey = pickFuzzyColumn(headers, "college");
  const semesterKey = pickFuzzyColumn(headers, "semester");

  if (!emailKey) {
    return {
      rows: [],
      warnings: [
        ...warnings,
        'No header containing "email" was found. Please export a CSV with an Email column.',
      ],
    };
  }
  if (!nameKey) {
    warnings.push(
      'No header containing "name" was found. Names will be auto-filled from email.'
    );
  }

  const rows: ParsedRegistrant[] = [];
  for (const r of parsed.data) {
    if (!r || typeof r !== "object") continue;
    const email = cleanEmail((r as Record<string, unknown>)[emailKey]);
    if (!email) continue;
    const name = cleanName(
      nameKey ? (r as Record<string, unknown>)[nameKey] : "",
      email
    );
    let phone_number = phoneKey ? String((r as Record<string, unknown>)[phoneKey] ?? "").trim() : "";
    let college = collegeKey ? String((r as Record<string, unknown>)[collegeKey] ?? "").trim() : "";
    let semester = semesterKey ? String((r as Record<string, unknown>)[semesterKey] ?? "").trim() : "";
    
    // Explicit hardcoded fallback for Google Forms exact headers just in case fuzzy fails
    if (!college) {
      const explicitCollege = (r as any)["Institution"] || (r as any)["Institution "] || (r as any)["college"];
      if (explicitCollege) college = String(explicitCollege).trim();
    }
    if (!semester) {
      const explicitSemester = (r as any)["Semester"] || (r as any)["Semester "] || (r as any)["semester"];
      if (explicitSemester) semester = String(explicitSemester).trim();
    }
    if (!phone_number) {
      const explicitPhone = (r as any)["Phone Number"] || (r as any)["Phone Number "] || (r as any)["phone_number"];
      if (explicitPhone) phone_number = String(explicitPhone).trim();
    }

    rows.push({ 
      name, 
      email, 
      phone_number: phone_number || undefined, 
      college: college || undefined, 
      semester: semester || undefined 
    });
  }

  const seen = new Set<string>();
  const deduped: ParsedRegistrant[] = [];
  for (const row of rows) {
    if (seen.has(row.email)) continue;
    seen.add(row.email);
    deduped.push(row);
  }

  warnings.push(
    `Detected columns → email: "${emailKey}"${nameKey ? `, name: "${nameKey}"` : ""}.`
  );

  return { rows: deduped, warnings };
}

export function UploadCsvCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sessionInput, setSessionInput] = useState("");
  const [activeSession, setActiveSessionState] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [lastCount, setLastCount] = useState<number | null>(null);

  useEffect(() => {
    const session = getActiveSession();
    setSessionInput(session);
    setActiveSessionState(session);
    
    const sync = () => {
      const s = getActiveSession();
      setSessionInput(s);
      setActiveSessionState(s);
    };
    window.addEventListener("hackathon-active-session-changed", sync);
    return () => window.removeEventListener("hackathon-active-session-changed", sync);
  }, []);

  const helper = useMemo(
    () => ({
      title: "Upload Google Form CSV",
      subtitle: "Bulk import names and emails for this registration session.",
    }),
    []
  );

  function commitSession() {
    const name = sessionInput.trim();
    if (!name) {
      setMessage("Enter a session name first (e.g. Day 1, Opening Ceremony).");
      return;
    }
    setActiveSession(name);
    setActiveSessionState(name);
    setMessage(`Active session set to “${name}”.`);
  }

  async function importRows(rows: ParsedRegistrant[]) {
    const session = sessionInput.trim();
    if (!session) {
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setWarnings([]);
    setLastCount(null);

    const res = await fetch("/api/attendance/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    const json = (await res.json().catch(() => null)) as
      | { imported: number; upserted: number; message?: string }
      | { error: string };

    setIsUploading(false);

    if (!res.ok || !json || "error" in json) {
      setMessage(
        (json && "error" in json ? json.error : null) ??
          "Import failed. Check server logs."
      );
      return;
    }

    setLastCount(json.upserted ?? json.imported);
    setMessage("Import complete.");
    setActiveSession(session);
    router.refresh();
  }

  async function handleFile(file: File) {
    setMessage(null);
    setWarnings([]);
    const text = await file.text();
    const { rows, warnings } = parseCsvText(text);
    setWarnings(warnings);

    if (!rows.length) {
      setMessage("No valid rows found (need a valid Email column + emails).");
      return;
    }

    await importRows(rows);
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 border-b border-zinc-100 pb-4">
        <div>
          <label
            htmlFor="session-name-input"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Event registration session
          </label>
          <p className="mt-0.5 text-xs text-zinc-500">
            Type a name, then press +. Check-ins use this session in{" "}
            <code className="rounded bg-zinc-100 px-1">attendance_logs</code>.
          </p>
          <div className="mt-2 flex flex-wrap items-stretch gap-2">
            <input
              id="session-name-input"
              type="text"
              value={sessionInput}
              onChange={(e) => setSessionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitSession();
                }
              }}
              placeholder="e.g. Day 1, Day 3, Opening Ceremony"
              className="min-w-[200px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#194685] focus:outline-none focus:ring-2 focus:ring-[#194685]/20"
            />
            <button
              type="button"
              onClick={commitSession}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#194685] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15386b]"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="text-lg font-semibold tracking-tight text-zinc-900">
            {helper.title}
          </div>
          <div className="mt-1 text-sm text-zinc-600">{helper.subtitle}</div>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#194685] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#15386b] disabled:opacity-60"
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          Select CSV
        </button>
      </div>

      {!activeSession && (
        <div className="mb-6 mt-6 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
          <p className="font-bold text-red-700">
            ⚠️ ACTION REQUIRED: You must set an Active Session Name in the box above and press '+' before uploading a CSV or checking in participants.
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "mt-4 flex min-h-36 items-center justify-center rounded-lg border border-dashed px-6 text-center",
          isDragging
            ? "border-[#194685] bg-sky-50"
            : "border-zinc-300 bg-zinc-50"
        )}
      >
        <div className="max-w-md">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#194685] text-white shadow-sm">
            <Upload className="h-5 w-5" />
          </div>
          <div className="mt-3 text-sm font-medium text-zinc-900">
            Drag and drop your CSV here
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Or click “Select CSV”. Session name must be set before import.
          </div>
          {isUploading ? (
            <div className="mt-3 text-xs font-medium text-[#194685]">
              Importing…
            </div>
          ) : null}
        </div>
      </div>

      {warnings.length ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="font-semibold">CSV mapping notes</div>
          <ul className="mt-1 list-disc pl-5">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm">
          <div className="font-medium text-zinc-900">{message}</div>
          {lastCount !== null ? (
            <div className="mt-1 text-xs text-zinc-600">
              Upserted {lastCount} registrants.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
