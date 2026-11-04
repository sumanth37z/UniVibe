import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { EventGridSkeleton } from "@/components/skeletons";
import { getCurrentUser } from "@/lib/auth";
import { getAllColleges, getEvents, type EventFilter } from "@/lib/queries";
import { plural } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Discover events" };

type SearchParams = Record<string, string | string[] | undefined>;

async function Results({ sp, userId }: { sp: SearchParams; userId: string }) {
  const when = sp.when === "past" ? "past" : sp.when === "all" ? "all" : "upcoming";
  const filter: EventFilter = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    category: typeof sp.category === "string" ? sp.category : undefined,
    mode: typeof sp.mode === "string" ? sp.mode : undefined,
    collegeId: typeof sp.college === "string" ? sp.college : undefined,
    when,
    order: sp.sort === "popular" ? "popular" : "date",
    userId: userId || undefined,
  };
  const events = await getEvents(filter);

  if (events.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="Nothing matches — yet"
        body="Try loosening a filter or two. Every campus posts on its own schedule, so new drops happen all week."
        action={{ href: "/events", label: "Reset filters" }}
      />
    );
  }

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
        {plural(events.length, when === "past" ? "past event" : "event")}
        {when !== "past" ? " on the radar" : " in the archive"}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </>
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  const [sp, colleges] = await Promise.all([searchParams, getAllColleges()]);
  const key = JSON.stringify(sp);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="The whole network, one feed"
        title="Discover events"
        description="Hackathons, culturals, sports meets and fests published by every campus on univibe. Filter down or just scroll."
      />
      {!user && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-ink px-5 py-4 text-cream">
          <p className="text-sm font-semibold">
            Browsing as a guest — events are free to explore.{" "}
            <span className="text-cream/60">Sign in to register for one.</span>
          </p>
          <div className="ml-auto flex gap-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-2 text-xs font-bold text-ink transition-transform duration-200 hover:scale-[1.03]"
            >
              Join the vibe
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-cream/10 px-4 py-2 text-xs font-bold text-cream ring-1 ring-cream/20 transition-colors hover:bg-cream/20"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
      <FilterBar colleges={colleges} totalLabel="" />
      <Suspense key={key} fallback={<EventGridSkeleton count={6} />}>
        <Results sp={sp} userId={user?.id ?? ""} />
      </Suspense>
    </div>
  );
}
