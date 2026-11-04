import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarX2, Globe2, MapPin } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { CollegeMark } from "@/components/monogram";
import { getCurrentUser } from "@/lib/auth";
import { getCollegeById, getEvents } from "@/lib/queries";
import { plural } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const college = await getCollegeById(id);
  if (!college) notFound();

  const [upcoming, past] = await Promise.all([
    getEvents({ collegeId: college.id, userId: user?.id }),
    getEvents({ collegeId: college.id, when: "past", limit: 6, userId: user?.id }),
  ]);

  return (
    <div className="space-y-8">
      <Link
        href="/colleges"
        className="group inline-flex items-center gap-2 text-sm font-bold text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        All colleges
      </Link>

      <header className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-cream sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: `hsl(${college.hue} 70% 55%)` }}
        />
        <div className="relative flex flex-wrap items-center gap-5">
          <CollegeMark shortName={college.shortName} hue={college.hue} className="size-16 text-lg ring-2 ring-cream/20" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream/50">
              Campus partner
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {college.name}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-4 text-sm font-medium text-cream/60">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {college.city}, {college.state}
              </span>
              {college.website && (
                <a
                  href={`https://${college.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-cream"
                >
                  <Globe2 className="size-4" />
                  {college.website}
                </a>
              )}
            </p>
          </div>
          <div className="ml-auto flex gap-8 text-right">
            <div>
              <p className="font-display text-3xl font-bold tabular-nums">{upcoming.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream/50">upcoming</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold tabular-nums">{past.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream/50">archived</p>
            </div>
          </div>
        </div>
      </header>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Upcoming on {college.shortName}
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title={`Nothing scheduled at ${college.shortName}`}
            body="This campus hasn't published its next event yet. Follow the network feed — it never stays quiet for long."
            action={{ href: "/events", label: "Browse all campuses" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-ink-2">
            From the archive — {plural(past.length, "past event")}
          </h2>
          <div className="grid grid-cols-1 gap-5 opacity-70 sm:grid-cols-2 xl:grid-cols-3">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
