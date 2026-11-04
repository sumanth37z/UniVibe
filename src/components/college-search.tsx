"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

import { CollegeMark } from "@/components/monogram";
import { EmptyState } from "@/components/empty-state";
import { Building2 } from "lucide-react";
import { plural } from "@/lib/utils";

export type CollegeRow = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  hue: number;
  eventsCount: number;
  studentsCount: number;
};

export function CollegeDirectory({ colleges }: { colleges: CollegeRow[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return colleges;
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.shortName.toLowerCase().includes(needle) ||
        c.city.toLowerCase().includes(needle) ||
        c.state.toLowerCase().includes(needle)
    );
  }, [colleges, q]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or city…"
          className="w-full rounded-full border border-line bg-cream py-3 pl-11 pr-4 text-sm font-medium text-ink placeholder:text-ink-3/70 transition-colors focus:border-iris focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No campus matches"
          body="Try a different spelling or city. The network grows every week."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/colleges/${c.id}`}
              className="group relative overflow-hidden rounded-3xl bg-cream p-6 ring-1 ring-ink/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-22px_rgba(23,19,16,0.35)]"
            >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: `linear-gradient(90deg, hsl(${c.hue} 65% 45%), hsl(${(c.hue + 40) % 360} 70% 55%))` }}
              />
              <div className="flex items-start justify-between">
                <CollegeMark shortName={c.shortName} hue={c.hue} className="size-13 text-base" />
                <ArrowUpRight className="size-4.5 text-ink-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold leading-snug tracking-tight line-clamp-2">
                {c.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-ink-3">
                {c.city}, {c.state}
              </p>
              <div className="mt-5 flex gap-5 border-t border-dashed border-line pt-4 text-xs font-semibold text-ink-2">
                <span className="font-display text-base font-bold text-ink tabular-nums">
                  {c.eventsCount}
                  <span className="ml-1 text-xs font-semibold text-ink-3">
                    {plural(c.eventsCount, "event").slice(plural(c.eventsCount, "event").indexOf(" "))}
                  </span>
                </span>
                <span className="font-display text-base font-bold text-ink tabular-nums">
                  {c.studentsCount}
                  <span className="ml-1 text-xs font-semibold text-ink-3">members</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
