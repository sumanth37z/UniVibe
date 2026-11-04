import Link from "next/link";
import { ArrowRight, History, Ticket } from "lucide-react";

import { Pill } from "@/components/badges";
import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { PageHeader } from "@/components/page-header";
import { RegisterButton } from "@/components/register-button";
import { requireUser } from "@/lib/auth";
import { getMyRegistrations } from "@/lib/queries";
import { plural } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My tickets" };

export default async function RegistrationsPage() {
  const user = await requireUser();
  const { upcoming, past } = await getMyRegistrations(user.id);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Your calendar, cross-campus"
        title="My tickets"
        description={
          upcoming.length > 0
            ? `You have ${plural(upcoming.length, "upcoming event")} booked across the network. Screenshots won't save you — show this page at the gate.`
            : "Every seat you reserve anywhere in the network lands here, ticket-style."
        }
        actions={
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-cream transition-transform duration-200 hover:scale-[1.03]"
          >
            <Ticket className="size-4.5" />
            Book more
          </Link>
        }
      />

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <Ticket className="size-5 text-iris" />
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No upcoming tickets"
            body="You haven't grabbed a seat yet. The network is full of hackathons, culturals and fests — go claim one."
            action={{ href: "/events", label: "Discover events" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((e) => (
              <div key={e.registrationId} className="flex flex-col gap-3">
                <EventCard event={{ ...e, isRegistered: true }} />
                <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/10">
                  <div className="flex items-center gap-2">
                    <Pill className="bg-emerald-100 text-emerald-800 ring-emerald-600/20">
                      Going
                    </Pill>
                    <span className="text-xs font-semibold text-ink-3">
                      booked {new Date(e.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <RegisterButton
                    eventId={e.id}
                    isRegistered
                    disabled={false}
                    fullWidth={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <History className="size-5 text-ink-3" />
            Been there
          </h2>
          <div className="grid grid-cols-1 gap-5 opacity-70 sm:grid-cols-2 xl:grid-cols-3">
            {past.map((e) => (
              <EventCard key={e.registrationId} event={{ ...e, isRegistered: true }} />
            ))}
          </div>
          <p className="mt-4 text-xs font-medium text-ink-3">
            {past.length} event{past.length === 1 ? "" : "s"} attended — keep the streak
            going.{" "}
            <Link href="/events" className="font-bold text-iris underline-offset-2 hover:underline">
              Find the next one <ArrowRight className="inline size-3.5" />
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
