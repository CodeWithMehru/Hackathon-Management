import { cn } from "@/lib/utils/cn";
import type { AttendanceStatus } from "@/lib/types/attendance";

export function StatusPill({ status }: { status: AttendanceStatus }) {
  const styles =
    status === "Registered"
      ? "bg-zinc-100 text-zinc-800 border-zinc-200"
      : status === "Checked In"
        ? "bg-blue-50 text-blue-900 border-blue-200"
        : "bg-zinc-900 text-white border-zinc-900";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        styles
      )}
    >
      {status}
    </span>
  );
}

