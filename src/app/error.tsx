"use client";

import { useEffect } from "react";
import { Database, RefreshCcw, TriangleAlert } from "lucide-react";

import { Logo } from "@/components/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbIssue =
    /database/i.test(error.message) ||
    /DATABASE_URL/.test(error.message) ||
    /ECONNREFUSED/.test(error.message) ||
    /relation .* does not exist/i.test(error.message);

  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-cream p-8 ring-1 ring-ink/10 sm:p-10">
        <Logo className="mb-8" />

        {isDbIssue ? (
          <>
            <div className="grid size-12 place-items-center rounded-2xl bg-ink text-lime">
              <Database className="size-6" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Can&rsquo;t reach the database
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              Univibe runs a zero-config embedded database by default — so this means a
              configured DATABASE_URL isn&rsquo;t answering, or the local .pglite folder is
              broken. Three moves to recover:
            </p>
            <ol className="mt-5 space-y-3 text-sm">
              <li className="rounded-2xl bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-cream/90">
                <span className="text-lime"># 1 — quickest: use the embedded DB.</span>
                <br />
                Comment out DATABASE_URL in .env, delete any stale .pglite folder, restart.
              </li>
              <li className="rounded-2xl bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-cream/90">
                <span className="text-lime"># 2 — want full Postgres? (Docker):</span>
                <br />
                docker run --name univibe-pg -e POSTGRES_PASSWORD=postgres
                -e POSTGRES_DB=app_db -p 5432:5432 -d postgres:16
              </li>
              <li className="rounded-2xl bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-cream/90">
                <span className="text-lime"># 3 — schema + demo data:</span>
                <br />
                npx drizzle-kit push && npx tsx scripts/seed.ts
              </li>
            </ol>
            <p className="mt-4 text-xs font-medium text-ink-3">
              Then restart <span className="font-mono">npm run dev</span> — or try again below.
            </p>
          </>
        ) : (
          <>
            <div className="grid size-12 place-items-center rounded-2xl bg-ink text-lime">
              <TriangleAlert className="size-6" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Something snagged
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              An unexpected error interrupted the vibe. It&rsquo;s usually temporary — try again.
            </p>
            <p className="mt-4 rounded-xl bg-ink/[0.05] p-3 font-mono text-xs text-ink-2 ring-1 ring-ink/10">
              {error.message || "Unknown error"}
            </p>
          </>
        )}

        <button
          onClick={() => reset()}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream transition-transform duration-200 hover:scale-[1.03]"
        >
          <RefreshCcw className="size-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
