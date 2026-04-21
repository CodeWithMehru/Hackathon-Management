"use client";

import { Search } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search registrations with name or email",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20"
      />
    </div>
  );
}

