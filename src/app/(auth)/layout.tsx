import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { CATEGORIES } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10 lg:px-14">
        <Link href="/" className="group w-fit">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-xs font-medium text-ink-3">
          Every campus. Every event. One home.
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-iris/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-lime/20 blur-3xl"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <p className="w-fit rounded-full border border-cream/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cream/70">
            The campus events network
          </p>
          <div>
            <h2 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-cream xl:text-6xl">
              12 campuses.
              <br />
              300+ events a semester.
              <br />
              <span className="text-lime">Zero FOMO left.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/60">
              From 48-hour hackathons in Bengaluru to beachside culturals in Goa —
              every seat, every stage, every scoreboard lives here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((c) => (
              <span
                key={c.slug}
                className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3.5 py-2 text-xs font-semibold text-cream/80"
              >
                <c.icon className="size-3.5" />
                {c.label}
              </span>
            ))}
          </div>
          <div className="border-t border-cream/10 pt-6 text-xs font-medium text-cream/40">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-cream"
            >
              Explore the network
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
