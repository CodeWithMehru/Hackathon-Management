"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ManageAction, AttendanceStatus } from "@/lib/types/attendance";

const actions: { id: ManageAction; label: string; reset?: boolean }[] = [
  { id: "CHECKIN", label: "Check-in" },
  { id: "CHECKOUT", label: "Check-out" },
  { id: "UNDO", label: "Undo Action", reset: true },
];

export function ManageMenu({
  disabled,
  currentStatus,
  onAction,
}: {
  disabled?: boolean;
  currentStatus?: AttendanceStatus;
  onAction: (action: ManageAction) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const label = useMemo(() => (isBusy ? "Updating..." : "Manage"), [isBusy]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled || isBusy}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#194685] px-3 text-sm font-semibold text-white shadow-sm hover:bg-[#15386b] disabled:opacity-60"
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-11 z-[100] min-w-[12rem] overflow-hidden rounded-lg border border-zinc-300 bg-white py-1 shadow-xl ring-1 ring-black/5"
        >
          {actions.map((a) => {
            const isActionDisabled = a.id === "CHECKOUT" && currentStatus !== "Checked In";
            return (
            <button
              key={a.id}
              type="button"
              role="menuitem"
              disabled={isActionDisabled}
              className={`flex w-full items-center px-3 py-2.5 text-left text-sm font-semibold ${
                a.reset
                  ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                  : "text-zinc-900 hover:bg-sky-50 hover:text-[#194685]"
              } active:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100 disabled:hover:text-gray-400`}
              onClick={async () => {
                setOpen(false);
                setIsBusy(true);
                try {
                  await onAction(a.id);
                } finally {
                  setIsBusy(false);
                }
              }}
            >
              {a.label}
            </button>
          )})}
        </div>
      ) : null}
    </div>
  );
}
