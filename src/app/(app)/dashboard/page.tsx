import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  BellRing,
  CalendarPlus,
  Flame,
  Megaphone,
  Ticket,
  Timer,
  TrendingUp,
} from "lucide-react";

import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { StatCard } from "@/components/stat";
import { EmptyState } from "@/components/empty-state";
import { CATEGORIES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import {
  getCategoryCounts,
  getEvents,
  getMyRegistrations,
  getOrganizerStats,
  getPlatformStats,
} from "@/lib/queries";
import { getClosingSoonCount } from "@/lib/actions/registrations";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, upcoming, trend, mine, categoryCounts, organizer, closing] =
    await Promise.all([
      getPlatformStats(),
      getEvents({ limit: 6, userId: user.id }),
      getEvents({ limit: 3, order: "popular", userId: user.id }),
      getMyRegistrations(user.id),
      getCategoryCounts(),
      user.role === "organizer" ? getOrganizerStats(user.id) : null,
      getClosingSoonCount(user.id),
    ]);

  const firstName = user.name.split(" ")[0];
  const nextTicket = mine.upcoming[0];

  return (
    <div className="space-y-10">
      <Reveal>
        <PageHeader
          eyebrow={format(new Date(), "EEEE, d MMMM yyyy")}
          title={`Good to see you, ${firstName}.`}
          description={
            user.role === "organizer"
              ? `Here's what's moving across the network — and on your own stage at ${user.college.shortName}.`
              : `Here's what's moving across ${stats.colleges} campuses right now. Your next weekend is in there somewhere.`
          }
          actions={
            user.role === "organizer" ? (
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-cream transition-transform duration-200 hover:scale-[1.03]"
              >
                <CalendarPlus className="size-4.5" />
                Create event
              </Link>
            ) : (
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-cream transition-transform duration-200 hover:scale-[1.03]"
              >
                <Ticket className="size-4.5" />
                Find an event
              </Link>
            )
          }
        />
      </Reveal>

      {/* stats */}
      <Reveal delay={0.05}>
        {user.role === "organizer" && organizer ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard tone="ink" icon={Megaphone} label="Your events" value={organizer.totalEvents} hint={`${organizer.upcomingEvents} upcoming`} />
            <StatCard tone="iris" icon={TrendingUp} label="Registrations" value={organizer.totalRegistrations} hint="across all your events" />
            <StatCard icon={Ticket} label="Your tickets" value={mine.upcoming.length} hint="events you're attending" />
            <StatCard tone={closing > 0 ? "lime" : "paper"} icon={Timer} label="Network live" value={stats.events} hint="published events" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard tone="ink" icon={Ticket} label="Your tickets" value={mine.upcoming.length} hint={nextTicket ? `next: ${nextTicket.title.slice(0, 24)}${nextTicket.title.length > 24 ? "…" : ""}` : "nothing booked yet"} />
            <StatCard tone="iris" icon={Flame} label="Live events" value={upcoming.length > 0 ? stats.events : 0} hint="across all campuses" />
            <StatCard tone={closing > 0 ? "lime" : "paper"} icon={BellRing} label="Closing soon" value={closing} hint="deadlines in 72h" />
            <StatCard icon={TrendingUp} label="Seats claimed" value={stats.registrations} hint="network-wide RSVPs" />
          </div>
        )}
      </Reveal>

      {/* categories */}
      <Reveal delay={0.08}>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/events?category=${c.slug}`}
              className="group flex shrink-0 items-center gap-3 rounded-2xl bg-cream px-5 py-4 ring-1 ring-ink/10 transition-all duration-200 hover:-translate-y-0.5 hover:ring-ink/25"
            >
              <span className={`grid size-9 place-items-center rounded-xl ring-1 ${c.chip}`}>
                <c.icon className="size-4.5" strokeWidth={2.2} />
              </span>
              <span>
                <span className="block text-sm font-bold">{c.label}</span>
                <span className="block text-xs font-medium text-ink-3">
                  {categoryCounts.get(c.slug) ?? 0} upcoming
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* trending */}
      <Reveal delay={0.1}>
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
              <Flame className="size-5 text-iris" />
              Trending across campuses
            </h2>
            <Link href="/events?sort=popular" className="group flex items-center gap-1 text-sm font-bold text-ink-2 hover:text-ink">
              View all
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {trend.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {trend.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Flame}
              title="The network is warming up"
              body="As soon as colleges publish events, the hottest tickets will surface right here."
              action={{ href: "/events", label: "Browse events" }}
            />
          )}
        </section>
      </Reveal>

      {/* happening soon */}
      <Reveal delay={0.12}>
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
              <Ticket className="size-5 text-iris" />
              Happening soon
            </h2>
            <Link href="/events" className="group flex items-center gap-1 text-sm font-bold text-ink-2 hover:text-ink">
              View all
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarPlus}
              title="Nothing on the horizon — yet"
              body="New events land here the moment a college hits publish. Check back soon or nudge your campus clubs."
              action={{ href: "/events?when=all", label: "See past events" }}
            />
          )}
        </section>
      </Reveal>
    </div>
  );
}
