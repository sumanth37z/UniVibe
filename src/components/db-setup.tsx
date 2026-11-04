import { Database } from "lucide-react";
import { Logo } from "@/components/logo";

export function DbSetupNotice() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-cream p-8 ring-1 ring-ink/10 sm:p-10">
        <Logo className="mb-8" />
        <div className="grid size-12 place-items-center rounded-2xl bg-ink text-lime">
          <Database className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Can&rsquo;t reach the database
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Univibe ships with a zero-config embedded database — so this screen means a
          configured <span className="font-mono text-ink">DATABASE_URL</span> points at a
          server that isn&rsquo;t answering (or the local{" "}
          <span className="font-mono text-ink">.pglite</span> folder is broken).
        </p>
        <ol className="mt-5 space-y-3 text-sm">
          <li className="rounded-2xl bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-cream/90">
            <span className="text-lime"># 1 — quickest fix: use the embedded DB.</span>
            <br />
            Comment out DATABASE_URL in .env, delete any stale .pglite folder, restart.
            Data persists in ./.pglite.
          </li>
          <li className="rounded-2xl bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-cream/90">
            <span className="text-lime"># 2 — want full Postgres? Start one:</span>
            <br />
            docker run --name univibe-pg -e POSTGRES_PASSWORD=postgres
            -e POSTGRES_DB=app_db -p 5432:5432 -d postgres:16
          </li>
          <li className="rounded-2xl bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-cream/90">
            <span className="text-lime"># 3 — then apply schema + demo data:</span>
            <br />
            npx drizzle-kit push && npx tsx scripts/seed.ts
          </li>
        </ol>
        <p className="mt-4 text-xs font-medium text-ink-3">
          Restart <span className="font-mono">npm run dev</span> afterwards. The demo world
          (12 colleges, 37 events, demo sign-in buttons) loads automatically either way.
        </p>
      </div>
    </div>
  );
}
