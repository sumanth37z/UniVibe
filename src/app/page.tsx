import Link from "next/link";
import { ArrowRight, ArrowUpRight, Asterisk, Sparkles } from "lucide-react";

import { Logo } from "@/components/logo";
import { DbSetupNotice } from "@/components/db-setup";
import { EventCard } from "@/components/event-card";
import { CollegeMark } from "@/components/monogram";
import { CATEGORIES, APP_TAGLINE } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { seedIfEmpty } from "@/lib/seed";
import {
  getCollegesWithStats,
  getEvents,
  getPlatformStats,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const MARQUEE = [
  "Hackathons",
  "Culturals",
  "Sports meets",
  "Design workshops",
  "Tech talks",
  "Music fests",
  "Robo-wars",
  "E-sports arenas",
];

export default async function LandingPage() {
  let user, stats, featured, colleges;
  try {
    await seedIfEmpty();
    [user, stats, featured, colleges] = await Promise.all([
      getCurrentUser(),
      getPlatformStats(),
      getEvents({ order: "popular", limit: 3, when: "upcoming" }),
      getCollegesWithStats(),
    ]);
  } catch (err) {
    console.error("[landing] data load failed:", err);
    return <DbSetupNotice />;
  }
  const heroEvent = featured[0];

  return (
    <div className="min-h-dvh">
      {/* nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="group">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink-2 md:flex">
          <Link href="/events" className="transition-colors hover:text-ink">Explore events</Link>
          <Link href="/colleges" className="transition-colors hover:text-ink">Colleges</Link>
          <a href="#how" className="transition-colors hover:text-ink">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream transition-transform duration-200 hover:scale-[1.03]"
            >
              Open dashboard
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink/5 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream transition-transform duration-200 hover:scale-[1.03]"
              >
                Join the vibe
                <ArrowRight className="size-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pt-10 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-iris/15 blur-3xl"
        />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2 ring-1 ring-ink/10">
            <Sparkles className="size-3.5 text-iris" />
            {stats.colleges} campuses · one network
          </p>
          <h1 className="mt-6 font-display text-[13vw] font-bold leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-[4.6rem]">
            Every fest. Every hackathon.
            <span className="mt-1 block text-iris">One home.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
            Univibe is where colleges publish their events and students from every
            campus discover them — and claim a seat before it&rsquo;s gone. {APP_TAGLINE}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-iris px-7 py-3.5 text-sm font-bold text-cream shadow-[0_16px_32px_-12px_rgba(91,73,242,0.6)] transition-transform duration-200 hover:scale-[1.03]"
            >
              Start exploring
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={user ? "/events/new" : "/login"}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm font-bold text-ink ring-1 ring-ink/15 transition-all duration-200 hover:ring-ink/40"
            >
              Host an event
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <dl className="mt-12 flex max-w-md items-start gap-8">
            {[
              { label: "Live events", value: stats.events },
              { label: "Partner colleges", value: stats.colleges },
              { label: "Seats claimed", value: stats.registrations },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-3">
                  {s.label}
                </dt>
                <dd className="mt-1 font-display text-3xl font-bold tracking-tight tabular-nums">
                  {s.value.toLocaleString("en-IN")}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* hero collage */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-ink/[0.04] ring-1 ring-ink/5" />
          {heroEvent ? (
            <div className="animate-float-slow">
              <EventCard event={heroEvent} />
            </div>
          ) : (
            <div className="rounded-3xl bg-cream p-8 text-center ring-1 ring-ink/10">
              Fresh events drop here the moment colleges publish them.
            </div>
          )}
          <div className="mt-5 grid grid-cols-2 gap-4">
            {featured.slice(1, 3).map((e, i) => (
              <div key={e.id} className={i === 1 ? "translate-y-3" : ""}>
                <EventCard event={e} />
              </div>
            ))}
          </div>
          {featured.length === 1 && (
            <p className="mt-5 text-center text-sm text-ink-3">
              More events are on their way.
            </p>
          )}
        </div>
      </section>

      {/* marquee */}
      <div className="-rotate-1 border-y border-ink bg-ink py-3.5 text-cream">
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap pr-8">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="flex items-center gap-8 font-display text-sm font-bold uppercase tracking-[0.2em]">
                {m}
                <Asterisk className="size-4 text-lime" strokeWidth={2.5} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* categories */}
      <section id="events" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-iris">
              Pick your vibe
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Six lanes. Infinite weekends.
            </h2>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 text-sm font-bold text-ink underline-offset-4 hover:underline"
          >
            Browse everything
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/events?category=${c.slug}`}
              className="group flex aspect-square flex-col justify-between rounded-3xl bg-cream p-5 ring-1 ring-ink/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(23,19,16,0.35)]"
            >
              <span className={`grid size-11 place-items-center rounded-2xl ring-1 ${c.chip}`}>
                <c.icon className="size-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-display text-lg font-bold tracking-tight">{c.label}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-ink-3">
                  Discover
                  <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* colleges */}
      <section id="colleges" className="border-y border-line bg-cream/60">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-iris">
              The network
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Campuses already on board
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {colleges.slice(0, 8).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3.5 rounded-2xl bg-cream p-4 ring-1 ring-ink/10"
              >
                <CollegeMark shortName={c.shortName} hue={c.hue} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{c.shortName}</p>
                  <p className="truncate text-xs font-medium text-ink-3">
                    {c.city} · {c.eventsCount} events
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how */}
      <section id="how" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {[
            {
              step: "01",
              title: "Your college publishes",
              body: "Organizers from partner campuses post hackathons, culturals, sports meets and fests with capacity, deadlines and venues.",
            },
            {
              step: "02",
              title: "You discover across campuses",
              body: "Filter by category, mode or college. An event at IIT is as visible to a Christ student as to the hosts.",
            },
            {
              step: "03",
              title: "One tap reserves your seat",
              body: "Register instantly, track your tickets in My hub, and show up. The roll-call syncs live for the organizer.",
            },
          ].map((s) => (
            <div key={s.step} className="relative rounded-3xl bg-cream p-8 ring-1 ring-ink/10">
              <span className="font-display text-5xl font-bold tracking-tight text-iris/20">
                {s.step}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA + footer */}
      <section className="px-5 pb-8 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-ink">
          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-iris/30 blur-3xl"
            />
            <h2 className="relative mx-auto max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight text-cream sm:text-5xl">
              Your next favorite weekend is already on the calendar.
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-sm font-medium text-cream/60">
              Students grab seats. Organizers fill halls. Everyone belongs to every campus.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 text-sm font-bold text-ink transition-transform duration-200 hover:scale-[1.03]"
              >
                {user ? "Open dashboard" : "Create your account"}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <footer className="flex flex-col items-center justify-between gap-4 border-t border-cream/10 px-6 py-6 sm:flex-row sm:px-12">
            <span className="text-xs font-semibold text-cream/40">
              © {new Date().getFullYear()} univibe — every campus, every event, one home.
            </span>
            <span className="text-xs font-semibold text-cream/40">
              Built for the ones who never miss a fest.
            </span>
          </footer>
        </div>
      </section>
    </div>
  );
}
