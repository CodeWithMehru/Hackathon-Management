"use client";

import { useMemo, useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import { ManageMenu } from "@/components/ManageMenu";
import type { ManageAction, HackathonAttendanceRow } from "@/lib/types/attendance";

export function ParticipantRow({
  participant,
  onAction,
}: {
  participant: HackathonAttendanceRow;
  onAction: (id: string, action: ManageAction) => Promise<void>;
}) {
  const initials = useMemo(() => {
    const parts = participant.name.trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || "P";
  }, [participant.name]);

  const [busy, setBusy] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#194685] text-white shadow-sm">
          <span className="text-sm font-semibold">{initials}</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900">
            {participant.name}
          </div>
          <div className="truncate text-xs text-zinc-600">{participant.email}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <StatusPill status={participant.status} />
        <ManageMenu
          disabled={busy}
          currentStatus={participant.status}
          onAction={async (action) => {
            setBusy(true);
            try {
              await onAction(participant.id, action);
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
    </div>
  );
}
