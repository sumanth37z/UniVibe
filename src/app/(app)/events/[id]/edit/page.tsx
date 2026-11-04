import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { EventForm } from "@/components/event-form";
import { PageHeader } from "@/components/page-header";
import { db } from "@/db";
import { events } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit event" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  if (user.role !== "organizer") redirect("/events");

  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.organizerId, user.id)))
    .limit(1);
  const event = rows[0];
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Tune the details"
        title={`Edit — ${event.title}`}
        description="Changes go live instantly across every campus feed."
      />
      <EventForm event={event} hostName={user.college.name} />
    </div>
  );
}
