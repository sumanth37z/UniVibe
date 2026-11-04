import { redirect } from "next/navigation";

import { EventForm } from "@/components/event-form";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create event" };

export default async function NewEventPage() {
  const user = await requireUser();
  if (user.role !== "organizer") redirect("/events");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Put your campus on the map"
        title="Create an event"
        description="Fill in the details once — students from every college on univibe will see it the second you publish."
      />
      <EventForm hostName={user.college.name} />
    </div>
  );
}
