import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="text-sm font-medium text-zinc-600">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
    </div>
  );
}

