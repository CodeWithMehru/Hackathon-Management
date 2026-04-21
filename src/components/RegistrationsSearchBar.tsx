"use client";

import { Search } from "lucide-react";

export function RegistrationsSearchBar({
  value,
  onChange,
  placeholder = "Search registrations with name or email",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex w-full overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full border-0 bg-transparent pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
        />
      </div>
      <button
        type="button"
        className="shrink-0 bg-[#194685] px-5 text-sm font-semibold text-white hover:bg-[#15386b]"
      >
        Search
      </button>
    </div>
  );
}
