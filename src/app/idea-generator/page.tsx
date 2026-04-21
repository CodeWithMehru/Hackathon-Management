"use client";

import { useState } from "react";

type IdeaResult = {
  id: string;
  theme_name: string;
  theme_meaning: string;
  idea_title: string;
  description: string;
  tech_stack: string;
};

export default function IdeaGeneratorPage() {
  const [idea, setIdea] = useState<IdeaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    if (!idea) return;
    const text = `Theme: ${idea.theme_name}\nIdea Title: ${idea.idea_title}\nDescription: ${idea.description}\nTech Stack: ${idea.tech_stack}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function generateIdea() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-idea", { method: "POST" });
      const json = (await res.json().catch(() => null)) as
        | { idea: IdeaResult }
        | { error: string }
        | null;

      if (!res.ok || !json || "error" in json) {
        setIdea(null);
        setError(
          (json && "error" in json ? json.error : null) ??
            "Unable to generate an idea right now."
        );
        return;
      }

      setIdea(json.idea);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#15386b]">
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Idea Generator
          </h1>
          <p className="mt-3 text-blue-100">
            One click. One unique idea. Claimed and locked instantly.
          </p>
        </header>

        <div className="mb-8 flex justify-center">
          <button
            type="button"
            onClick={() => void generateIdea()}
            disabled={loading}
            className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-9 text-lg font-semibold text-[#194685] shadow-xl transition hover:scale-[1.01] hover:bg-blue-50 disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate My Unique Idea"}
          </button>
        </div>

        {error ? (
          <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-5 text-center text-amber-900">
            {error === "POOL_EMPTY"
              ? "Ideas pool empty! Please ask the organizer to generate more."
              : error}
          </div>
        ) : null}

        {idea ? (
          <section className="relative mx-auto mt-6 max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
            <div className="absolute right-6 top-6">
              <button
                onClick={copyToClipboard}
                className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              >
                {copied ? "Copied!" : "Copy Idea"}
              </button>
            </div>

            <p className="text-sm font-semibold uppercase tracking-wide text-[#194685]">
              Theme
            </p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              {idea.theme_name}
            </h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-zinc-700">
              {idea.theme_meaning}
            </p>

            <div className="my-6 h-px bg-zinc-200" />

            <p className="text-sm font-semibold uppercase tracking-wide text-[#194685]">
              Idea Title
            </p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
              {idea.idea_title}
            </h3>

            <p className="mt-4 text-base leading-7 text-zinc-700">
              {idea.description}
            </p>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#194685]">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {idea.tech_stack
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-[#194685]"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <footer className="pb-8 text-center text-sm text-blue-200/70">
        Built by{" "}
        <a
          href="https://github.com/CodeWithMehru"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium transition-colors hover:text-white hover:underline"
        >
          CodeWithMehru
        </a>
      </footer>
    </main>
  );
}

