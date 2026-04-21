"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export function ResetAllDataButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onReset() {
    if (
      !window.confirm(
        "Delete ALL attendance rows? This cannot be undone. Use before a new event."
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/attendance/all", { method: "DELETE" });
      const json = (await res.json().catch(() => null)) as
        | { ok: boolean }
        | { error: string }
        | null;
      if (!res.ok || !json || "error" in json) {
        alert(
          (json && "error" in json ? json.error : null) ?? "Reset failed"
        );
      }
      localStorage.removeItem("activeSession");
      window.dispatchEvent(new Event("hackathon-active-session-changed"));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onReset()}
      disabled={busy}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      {busy ? "Resetting…" : "Reset"}
    </button>
  );
}
