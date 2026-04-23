"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { RegistrationsSearchBar } from "@/components/RegistrationsSearchBar";
import { ParticipantRow } from "@/components/ParticipantRow";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getActiveSession } from "@/lib/active-session";
import type { ManageAction, HackathonAttendanceRow } from "@/lib/types/attendance";

export default function RegistrationsClient({
  initialParticipants,
}: {
  initialParticipants: HackathonAttendanceRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<HackathonAttendanceRow[]>(
    initialParticipants
  );
  const [activeSession, setActiveSessionState] = useState("");
  const [exportBusy, setExportBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCollege, setNewCollege] = useState("");
  const [newSemester, setNewSemester] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  useEffect(() => {
    setActiveSessionState(getActiveSession());
    const sync = () => setActiveSessionState(getActiveSession());
    window.addEventListener("hackathon-active-session-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hackathon-active-session-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    });
  }, [query, rows]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel("attendance-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Hackathon_Attendance" },
        (payload: { new: Record<string, unknown> }) => {
          const next = payload.new as HackathonAttendanceRow | null;
          if (!next?.id) return;
          const normalized: HackathonAttendanceRow = {
            ...next,
            attendance_logs: next.attendance_logs ?? {},
          };
          setRows((prev) => {
            const idx = prev.findIndex((p) => p.id === normalized.id);
            if (idx === -1) return [normalized, ...prev];
            const copy = prev.slice();
            copy[idx] = { ...copy[idx], ...normalized };
            return copy;
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function onManage(id: string, action: ManageAction, rollNumber?: string) {
    const session = getActiveSession();
    if (!session) {
      throw new Error("Set an active session name on the Dashboard before check-in.");
    }
    const res = await fetch("/api/attendance/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, session, roll_number: rollNumber }),
    });

    const json = (await res.json().catch(() => null)) as
      | { row: HackathonAttendanceRow }
      | { error: string }
      | null;

    if (!res.ok || !json || "error" in json) {
      throw new Error((json && "error" in json ? json.error : null) ?? "Failed");
    }

    const row = json.row;
    setRows((prev) => {
      const idx = prev.findIndex((p) => p.id === row.id);
      const merged = { ...row, attendance_logs: row.attendance_logs ?? {} };
      if (idx === -1) return [merged, ...prev];
      const copy = prev.slice();
      copy[idx] = merged;
      return copy;
    });
  }

  async function exportRegistrations() {
    const session = getActiveSession();
    if (!session) {
      alert("Set an active session name on the Dashboard first.");
      return;
    }
    setExportBusy(true);
    try {
      const q = encodeURIComponent(session);
      const res = await fetch(`/api/attendance/export/registrations?session=${q}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof (err as { error?: string }).error === "string"
            ? (err as { error: string }).error
            : "Export failed"
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations-${session.replace(/\s+/g, "-")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } finally {
      setExportBusy(false);
    }
  }

  async function handleAddAttendee(e: React.FormEvent) {
    e.preventDefault();
    setAddBusy(true);
    try {
      const res = await fetch("/api/admin/add-attendee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newName, 
          email: newEmail,
          college: newCollege,
          semester: newSemester,
          phone_number: newPhone,
          roll_number: newRoll
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to add attendee");
      }
      setIsModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewCollege("");
      setNewSemester("");
      setNewPhone("");
      setNewRoll("");
      alert("Attendee added successfully!");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setAddBusy(false);
    }
  }

  const emptyDb = rows.length === 0;
  const displayStart = filtered.length === 0 ? 0 : 1;
  const displayEnd = filtered.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
            Registrations
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            View and manage who is attending your event.
            {activeSession ? (
              <>
                {" "}
                <span className="font-semibold text-zinc-800">
                  Active session: {activeSession}
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void exportRegistrations()}
            disabled={exportBusy || emptyDb || !activeSession}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border-2 border-[#194685] bg-white px-5 text-sm font-semibold text-[#194685] shadow-sm hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exportBusy ? "Exporting…" : "Export Registrations"}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#194685] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15386b]"
          >
            <Plus className="h-4 w-4" />
            Add Attendee
          </button>
        </div>
      </div>

      {emptyDb ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-zinc-700">
            No data yet. Upload a CSV and set the name of the event registration
            session.
          </p>
        </div>
      ) : (
        <>
          <RegistrationsSearchBar value={query} onChange={setQuery} />

          <p className="text-sm text-zinc-600">
            Displaying registrations{" "}
            {displayStart === 0 ? (
              "0"
            ) : (
              <>
                {displayStart} – {displayEnd}
              </>
            )}{" "}
            of {rows.length} in total
            {query.trim() ? (
              <span className="text-zinc-500"> (search filtered)</span>
            ) : null}
          </p>

          <div className="space-y-3">
            {filtered.map((p) => (
              <ParticipantRow key={p.id} participant={p} onAction={onManage} />
            ))}
            {!filtered.length ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">
                No registrations match your search.
              </div>
            ) : null}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-zinc-900">Add Attendee</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Manually insert a single attendee into the active session.
            </p>

            <form onSubmit={handleAddAttendee} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#194685] focus:outline-none focus:ring-1 focus:ring-[#194685]"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#194685] focus:outline-none focus:ring-1 focus:ring-[#194685]"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Institution (Required)
                </label>
                <input
                  type="text"
                  required
                  value={newCollege}
                  onChange={(e) => setNewCollege(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#194685] focus:outline-none focus:ring-1 focus:ring-[#194685]"
                  placeholder="e.g. Example University"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Semester (Required)
                </label>
                <input
                  type="text"
                  required
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#194685] focus:outline-none focus:ring-1 focus:ring-[#194685]"
                  placeholder="e.g. 5th"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#194685] focus:outline-none focus:ring-1 focus:ring-[#194685]"
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Roll Number (Optional)
                </label>
                <input
                  type="text"
                  value={newRoll}
                  onChange={(e) => setNewRoll(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#194685] focus:outline-none focus:ring-1 focus:ring-[#194685]"
                  placeholder="e.g. CS-24-101"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-100 pt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={addBusy}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addBusy}
                  className="rounded-lg bg-[#194685] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15386b] disabled:opacity-60"
                >
                  {addBusy ? "Saving..." : "Save Attendee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
