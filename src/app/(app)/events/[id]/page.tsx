import Link from "next/link";
import { notFound } from "next/navigation";
import { isPast } from "date-fns";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarRange,
  DoorOpen,
  Globe2,
  Hourglass,
  IndianRupee,
  MapPin,
  Ticket,
  Timer,
  Trophy,
  Users,
  UsersRound,
} from "lucide-react";

import { CategoryBadge, Pill, StatusPill } from "@/components/badges";
import { modeLabel } from "@/lib/constants";
import { EventCard } from "@/components/event-card";
import { Avatar, CollegeMark } from "@/components/monogram";
import { ManageEventActions } from "@/components/manage-event";
import { Poster } from "@/components/poster";
import { RegisterButton } from "@/components/register-button";
import { FlashToast } from "@/components/flash-toast";
import { getCurrentUser } from "@/lib/auth";
import {
  getEventAttendees,
  getEventDetail,
  getEvents,
} from "@/lib/queries";
import { fmtDate, fmtDateTime, fmtTime, inr, plural, timeUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Fact({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-cream p-4 ring-1 ring-ink/10">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-lime">
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">
          {label}
        </span>
        <span className="block truncate text-sm font-bold">{value}</span>
        {sub && <span className="block truncate text-xs font-medium text-ink-3">{sub}</span>}
      </span>
    </div>
  );
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  const detail = await getEventDetail(id, user?.id);
  if (!detail) notFound();

  const { event, host, organizerName, registered, isRegistered } = detail;
  const isOwner = !!user && event.organizerId === user.id;
  const deadlinePassed = isPast(new Date(event.registrationDeadline));
  const eventPassed = isPast(new Date(event.endsAt));
  const spotsLeft = Math.max(event.capacity - registered, 0);
  const isFull = spotsLeft <= 0;
  const canRegister =
    event.status === "published" && !deadlinePassed && !eventPassed && !isFull && !isOwner;

  const [attendees, similar] = await Promise.all([
    isOwner ? getEventAttendees(event.id) : Promise.resolve([]),
    getEvents({
      category: event.category,
      limit: 4,
      userId: user?.id,
    }),
  ]);
  const similarFiltered = similar.filter((s) => s.id !== event.id).slice(0, 3);

  const registerDisabledReason = eventPassed
    ? "This event has ended"
    : event.status === "cancelled"
      ? "Event was cancelled"
      : event.status === "draft"
        ? "Not published yet"
        : deadlinePassed
          ? "Registration closed"
          : isFull
            ? "Event is full"
            : "Registration closed";

  return (
    <div className="space-y-8">
      {sp.updated === "1" && <FlashToast param="updated" message="Event updated" />}

      <Link
        href="/events"
        className="group inline-flex items-center gap-2 text-sm font-bold text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        Back to discovery
      </Link>

      {/* hero */}
      <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-ink/10">
        <Poster id={event.id} category={event.category} hue={event.hue} className="h-60 sm:h-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-9">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <CategoryBadge category={event.category} className="backdrop-blur" />
              <span className="rounded-full bg-cream/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cream ring-1 ring-cream/25 backdrop-blur">
                {modeLabel(event.mode)}
              </span>
              {event.status !== "published" && <StatusPill status={event.status} />}
            </div>
            <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-cream sm:text-5xl">
              {event.title}
            </h1>
            {event.tagline && (
              <p className="mt-2 max-w-xl text-sm font-medium text-cream/75 sm:text-base">
                {event.tagline}
              </p>
            )}
          </div>
          {event.featured > 0 && (
            <span className="rounded-full bg-lime px-4 py-2 text-xs font-bold uppercase tracking-widest text-ink">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* main column */}
        <div className="space-y-8">
          {/* host */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-cream p-5 ring-1 ring-ink/10">
            <Link href={`/colleges/${host.id}`} className="group flex items-center gap-4">
              <CollegeMark shortName={host.shortName} hue={host.hue} className="size-13" />
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">
                  Hosted by
                </span>
                <span className="block font-display text-lg font-bold tracking-tight group-hover:underline">
                  {host.name}
                </span>
                <span className="block text-xs font-medium text-ink-3">
                  {host.city}, {host.state} · curated by {organizerName}
                </span>
              </span>
            </Link>
            <BadgeCheck className="size-6 text-iris" />
          </div>

          {/* facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Fact icon={CalendarRange} label="When" value={fmtDate(event.startsAt)} sub={`${fmtTime(event.startsAt)} → ${fmtTime(event.endsAt)}`} />
            <Fact icon={Timer} label="Register by" value={fmtDate(event.registrationDeadline)} sub={deadlinePassed ? "closed" : timeUntil(event.registrationDeadline)} />
            <Fact icon={MapPin} label="Where" value={event.mode === "online" ? "Online" : event.venue} sub={event.city} />
            <Fact icon={Users} label="Capacity" value={String(event.capacity)} sub={`${registered} registered`} />
            <Fact icon={IndianRupee} label="Entry" value={inr(event.feeInr)} sub={event.feeInr === 0 ? "on the house" : "per registration"} />
            {event.teamSizeMax > 1 ? (
              <Fact icon={UsersRound} label="Team size" value={`${event.teamSizeMin}–${event.teamSizeMax}`} sub="members per team" />
            ) : event.prizePool ? (
              <Fact icon={Trophy} label="Prize pool" value={event.prizePool} sub="up for grabs" />
            ) : (
              <Fact icon={Globe2} label="Mode" value={event.mode === "hybrid" ? "Hybrid" : event.mode === "online" ? "Online" : "In-person"} />
            )}
          </div>

          {event.prizePool && event.teamSizeMax > 1 && (
            <div className="flex items-center gap-3 rounded-2xl bg-lime/60 p-4 ring-1 ring-lime">
              <Trophy className="size-5 text-ink" />
              <p className="text-sm font-bold">
                Prize pool: {event.prizePool}
                <span className="font-medium text-ink-2"> — bring your A-game.</span>
              </p>
            </div>
          )}

          {/* description */}
          <div className="rounded-2xl bg-cream p-6 ring-1 ring-ink/10 sm:p-8">
            <h2 className="font-display text-xl font-bold tracking-tight">About this event</h2>
            <div className="prose-sm mt-4 max-w-none space-y-3 text-[15px] leading-relaxed text-ink-2">
              {event.description.split(/\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {event.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {event.tags.map((t) => (
                  <Pill key={t}>#{t}</Pill>
                ))}
              </div>
            )}
          </div>

          {/* attendees for owner */}
          {isOwner && (
            <div className="rounded-2xl bg-cream p-6 ring-1 ring-ink/10 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold tracking-tight">
                  Roll call
                </h2>
                <Pill>{plural(registered, "registration")}</Pill>
              </div>
              {attendees.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-ink/20 p-5 text-sm text-ink-2">
                  No registrations yet. Share the link around campus whispers travel fast.
                </p>
              ) : (
                <ul className="mt-5 divide-y divide-line">
                  {attendees.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-3">
                      <Avatar name={a.userName} hue={a.userHue} className="ring-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{a.userName}</p>
                        <p className="truncate text-xs font-medium text-ink-3">
                          {a.collegeShortName} · {a.userEmail}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-ink-3">
                        {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* aside */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-3xl bg-ink text-cream ring-1 ring-ink">
            <div className="p-6">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-3xl font-bold tracking-tight">
                  {inr(event.feeInr)}
                </p>
                <p className="text-xs font-semibold text-cream/60">
                  {event.teamSizeMax > 1 ? `teams of ${event.teamSizeMin}–${event.teamSizeMax}` : "per head"}
                </p>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-cream/80">
                  <Hourglass className="size-4 shrink-0 text-lime" />
                  <span>
                    {deadlinePassed
                      ? "Registration deadline passed"
                      : timeUntil(event.registrationDeadline) === "ended"
                        ? "Registration deadline passed"
                        : `Registration closes ${timeUntil(event.registrationDeadline)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-cream/80">
                  <DoorOpen className="size-4 shrink-0 text-lime" />
                  <span>
                    {isFull
                      ? "House full — joins the waitlist whispers"
                      : `${plural(spotsLeft, "seat")} left of ${event.capacity}`}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-cream/80">
                  <CalendarRange className="size-4 shrink-0 text-lime" />
                  <span>{fmtDateTime(event.startsAt)}</span>
                </div>
              </div>

              {!eventPassed && event.status === "published" && (
                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-cream/15">
                    <div
                      className="h-full rounded-full bg-lime transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.round((registered / Math.max(event.capacity, 1)) * 100), 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-right text-[11px] font-semibold text-cream/50">
                    {Math.round((registered / Math.max(event.capacity, 1)) * 100)}% booked
                  </p>
                </div>
              )}

              <div className="mt-6">
                {isOwner ? (
                  <ManageEventActions eventId={event.id} status={event.status} />
                ) : !user ? (
                  canRegister ? (
                    <Link
                      href={`/login?next=/events/${event.id}`}
                      className="group flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-cream ring-1 ring-cream/20 transition-all duration-200 hover:scale-[1.02] hover:bg-iris"
                    >
                      <Ticket className="size-4.5 transition-transform duration-300 group-hover:-rotate-12" />
                      Sign in to register
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-full bg-cream/10 px-7 py-3.5 text-sm font-bold text-cream/40"
                    >
                      {registerDisabledReason}
                    </button>
                  )
                ) : (
                  <RegisterButton
                    eventId={event.id}
                    isRegistered={isRegistered}
                    disabled={!canRegister && !isRegistered}
                    disabledReason={registerDisabledReason}
                  />
                )}
              </div>

              {isRegistered && !isOwner && user && (
                <div className="ticket-edge mt-6 border-t pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream/50">
                    Your ticket
                  </p>
                  <p className="mt-1.5 font-display text-lg font-bold tracking-tight text-lime">
                    {user.name}
                  </p>
                  <p className="text-xs font-medium text-cream/60">
                    {user.college.shortName} · show this page at the gate
                  </p>
                </div>
              )}
            </div>
          </div>

          {event.onlineLink && (event.mode !== "in_person") && (
            <a
              href={event.onlineLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-between rounded-2xl bg-cream p-4 text-sm font-bold ring-1 ring-ink/10 transition-colors hover:ring-ink/30"
            >
              <span className="inline-flex items-center gap-2">
                <Globe2 className="size-4.5 text-iris" />
                Join link
              </span>
              <span className="text-xs font-semibold text-ink-3">opens in new tab</span>
            </a>
          )}
        </aside>
      </div>

      {/* similar */}
      {similarFiltered.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
            More like this
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {similarFiltered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
