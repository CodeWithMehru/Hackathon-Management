"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ThemeIdeaPoolManager() {
  const router = useRouter();
  const [theme, setTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function generateIdeas() {
    if (!theme.trim()) {
      setMessage("Please enter a hackathon theme.");
      return;
    }

    setIsGenerating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: theme.trim() }),
      });
      const json = (await res.json().catch(() => null)) as
        | { inserted: number }
        | { error: string }
        | null;

      if (!res.ok || !json || "error" in json) {
        setMessage(
          (json && "error" in json ? json.error : null) ??
            "Bulk generation failed."
        );
        return;
      }

      setMessage(`Generated and inserted ${json.inserted} ideas.`);
      router.refresh();
    } finally {
      setIsGenerating(false);
    }
  }

  async function resetIdeas() {
    if (!window.confirm("Are you sure you want to delete ALL ideas? This cannot be undone.")) {
      return;
    }
    
    setIsResetting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/reset-ideas", { method: "POST" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json || "error" in json) {
        setMessage(json?.error ?? "Reset failed.");
        return;
      }

      setMessage("Idea pool reset successfully.");
      router.refresh();
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">
        Theme Idea Pool Manager
      </h2>
      <p className="mt-1 text-sm text-zinc-600">
        Generate 20 beginner-friendly ideas and load them into the claim pool.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Enter hackathon theme..."
          className="flex-1 w-full px-4 py-3 text-base border rounded-md border-zinc-300 text-zinc-900 outline-none focus:border-[#194685] focus:ring-2 focus:ring-[#194685]/20"
        />
        <button
          type="button"
          disabled={isGenerating || isResetting}
          onClick={() => void generateIdeas()}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#194685] px-5 text-sm font-semibold text-white hover:bg-[#15386b] disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </button>
        <button
          type="button"
          disabled={isGenerating || isResetting}
          onClick={() => void resetIdeas()}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isResetting ? "Processing..." : "Reset"}
        </button>
      </div>

      {message ? (
        <p className="mt-3 text-sm text-zinc-700">{message}</p>
      ) : null}
    </section>
  );
}

