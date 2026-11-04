"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListFilter, Loader2, Search, X } from "lucide-react";

import { CATEGORIES, MODES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FilterBar({
  colleges,
  totalLabel,
}: {
  colleges: { id: string; shortName: string; city: string }[];
  totalLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [mobileFilters, setMobileFilters] = useState(false);

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      });
    },
    [params, pathname, router]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== (params.get("q") ?? "")) update("q", q);
    }, 350);
    return () => clearTimeout(t);
  }, [q, params, update]);

  const activeCategory = params.get("category") ?? "";
  const activeMode = params.get("mode") ?? "";
  const activeWhen = params.get("when") ?? "upcoming";
  const activeCollege = params.get("college") ?? "";
  const activeSort = params.get("sort") ?? "";

  const activeCount = useMemo(
    () => [activeCategory, activeMode, activeCollege, activeSort, params.get("q")].filter(Boolean).length,
    [activeCategory, activeMode, activeCollege, activeSort, params]
  );

  const selects = (
    <>
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">Mode</span>
        <select
          value={activeMode}
          onChange={(e) => update("mode", e.target.value)}
          className="rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-semibold text-ink"
        >
          <option value="">Any mode</option>
          {MODES.map((m) => (
            <option key={m.slug} value={m.slug}>{m.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">College</span>
        <select
          value={activeCollege}
          onChange={(e) => update("college", e.target.value)}
          className="max-w-44 rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-semibold text-ink"
        >
          <option value="">Every campus</option>
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.shortName} · {c.city}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">Time</span>
        <select
          value={activeWhen}
          onChange={(e) => update("when", e.target.value)}
          className="rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-semibold text-ink"
        >
          <option value="upcoming">Upcoming</option>
          <option value="past">Past archive</option>
          <option value="all">Everything</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">Sort</span>
        <select
          value={activeSort}
          onChange={(e) => update("sort", e.target.value)}
          className="rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-semibold text-ink"
        >
          <option value="">Soonest first</option>
          <option value="popular">Most wanted</option>
        </select>
      </label>
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events, colleges, tags…"
            className="w-full rounded-full border border-line bg-cream py-3 pl-11 pr-4 text-sm font-medium text-ink placeholder:text-ink-3/70 transition-colors focus:border-iris focus:outline-none"
          />
          {isPending && (
            <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-iris" />
          )}
        </div>
        <div className="hidden items-center gap-3 lg:flex">{selects}</div>
        <button
          onClick={() => setMobileFilters((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold lg:hidden",
            mobileFilters ? "border-ink bg-ink text-cream" : "border-line bg-cream text-ink"
          )}
        >
          <ListFilter className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-iris text-[10px] font-bold text-cream">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {mobileFilters && (
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-cream p-4 lg:hidden">
          {selects}
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => update("category", "")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ring-1 transition-all duration-200",
            !activeCategory
              ? "bg-ink text-cream ring-ink"
              : "bg-cream text-ink-2 ring-ink/15 hover:ring-ink/40"
          )}
        >
          All events
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            onClick={() => update("category", activeCategory === c.slug ? "" : c.slug)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ring-1 transition-all duration-200",
              activeCategory === c.slug
                ? "bg-ink text-cream ring-ink"
                : `${c.chip} hover:scale-[1.03]`
            )}
          >
            <c.icon className="size-3.5" strokeWidth={2.4} />
            {c.label}
          </button>
        ))}
        {activeCount > 0 && (
          <button
            onClick={() =>
              startTransition(() => router.replace(pathname, { scroll: false }))
            }
            className="flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink-3 underline-offset-2 hover:text-ink hover:underline"
          >
            <X className="size-3.5" />
            Clear all
          </button>
        )}
        <span className="ml-auto hidden shrink-0 pl-3 text-xs font-semibold text-ink-3 sm:block">
          {totalLabel}
        </span>
      </div>
    </div>
  );
}
