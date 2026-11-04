import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarPlus, Megaphone, TrendingUp, Users } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { FlashToast } from "@/components/flash-toast";
import { ManageList } from "@/components/manage-list";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat";
import { requireUser } from "@/lib/auth";
import { getEvents, getOrganizerStats } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage events" };

export default async function MyEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  if (user.role !== "organizer") redirect("/events");

  const sp = await searchParams;
  const [events, stats] = await Promise.all([
    getEvents({ organizerId: user.id, includeDrafts: true, when: "all", userId: user.id }),
    getOrganizerStats(user.id),
  ]);

  return (
    <div className="space-y-7">
      {sp.created === "1" && <FlashToast param="created" message="Event created! It's live for every campus." />}

      <PageHeader
        eyebrow={`${user.college.shortName} · organizer hub`}
        title="Manage events"
        description="Everything you've published under your campus banner. Track registrations, edit details, or pull an event offline."
        actions={
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-cream transition-transform duration-200 hover:scale-[1.03]"
          >
            <CalendarPlus className="size-4.5" />
            Create event
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard tone="ink" icon={Megaphone} label="Events" value={stats.totalEvents} hint={`${stats.upcomingEvents} upcoming`} />
        <StatCard tone="iris" icon={Users} label="Registrations" value={stats.totalRegistrations} hint="all-time" />
        <StatCard tone="lime" icon={TrendingUp} label="Avg / event" value={stats.totalEvents ? Math.round(stats.totalRegistrations / Math.max(stats.totalEvents, 1)) : 0} hint="students per event" />
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Your stage is empty"
          body="You haven't published an event yet. Hackathon, culturals, sports meet — put the first one up and every campus will see it."
          action={{ href: "/events/new", label: "Create your first event" }}
        />
      ) : (
        <ManageList events={events} />
      )}
    </div>
  );
}
