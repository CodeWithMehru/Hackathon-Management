import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f2f5d] via-[#194685] to-[#1f4f92] text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider">
          HackDesk Platform
        </p>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to the HackDesk Idea Hub
        </h1>
        <p className="mt-4 max-w-2xl text-base text-blue-100 sm:text-lg">
          Claim unique hackathon ideas with a beautiful lock-based generator
          experience designed for fairness and speed.
        </p>
        <Link
          href="/idea-generator"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-lg font-semibold text-[#194685] shadow-xl transition hover:scale-[1.01] hover:bg-blue-50"
        >
          Go to Idea Generator
        </Link>

        <footer className="absolute bottom-8 text-sm text-blue-200/70">
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
      </div>
    </main>
  );
}
