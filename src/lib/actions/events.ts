"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { categoryMeta } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";

const eventSchema = z
  .object({
    title: z.string().trim().min(4, "Title needs at least 4 characters").max(160),
    tagline: z.string().trim().max(200).optional().default(""),
    category: z.enum([
      "hackathon",
      "cultural",
      "sports",
      "workshop",
      "tech_talk",
      "fest",
    ]),
    mode: z.enum(["in_person", "online", "hybrid"]),
    venue: z.string().trim().min(2, "Add a venue").max(180),
    city: z.string().trim().min(2, "Add a city").max(80),
    onlineLink: z.string().trim().url("Enter a valid URL").or(z.literal("")).optional(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    registrationDeadline: z.coerce.date(),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(100000),
    feeInr: z.coerce.number().int().min(0).max(1000000),
    prizePool: z.string().trim().max(120).optional(),
    teamSizeMin: z.coerce.number().int().min(1).max(20),
    teamSizeMax: z.coerce.number().int().min(1).max(20),
    tags: z.string().trim().max(300).optional(),
    status: z.enum(["draft", "published", "cancelled"]),
    description: z.string().trim().min(20, "Description needs at least 20 characters"),
  })
  .refine((d) => d.endsAt > d.startsAt, {
    message: "End time must be after the start time",
    path: ["endsAt"],
  })
  .refine((d) => d.registrationDeadline <= d.startsAt, {
    message: "Deadline must be before the event starts",
    path: ["registrationDeadline"],
  })
  .refine((d) => d.teamSizeMax >= d.teamSizeMin, {
    message: "Max team size must be ≥ min",
    path: ["teamSizeMax"],
  });

function parseTags(raw?: string) {
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8)
    ),
  ];
}

export type EventFormState = { error?: string; field?: string } | null;

export async function createEvent(
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const user = await requireUser();
  if (user.role !== "organizer") {
    return { error: "Only organizer accounts can publish events" };
  }

  const parsed = eventSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.message, field: String(issue.path[0] ?? "") };
  }
  const d = parsed.data;

  await db.insert(events).values({
    title: d.title,
    tagline: d.tagline,
    category: d.category,
    mode: d.mode,
    venue: d.venue,
    city: d.city,
    onlineLink: d.onlineLink || null,
    startsAt: d.startsAt,
    endsAt: d.endsAt,
    registrationDeadline: d.registrationDeadline,
    capacity: d.capacity,
    feeInr: d.feeInr,
    prizePool: d.prizePool || null,
    teamSizeMin: d.teamSizeMin,
    teamSizeMax: d.teamSizeMax,
    tags: parseTags(d.tags),
    status: d.status,
    description: d.description,
    hue: categoryMeta(d.category).hue + Math.floor(Math.random() * 24) - 12,
    hostCollegeId: user.collegeId,
    organizerId: user.id,
  });

  revalidatePath("/events");
  revalidatePath("/my-events");
  revalidatePath("/dashboard");
  redirect("/my-events?created=1");
}

export async function updateEvent(
  eventId: string,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const user = await requireUser();
  const parsed = eventSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.message, field: String(issue.path[0] ?? "") };
  }
  const d = parsed.data;

  const result = await db
    .update(events)
    .set({
      title: d.title,
      tagline: d.tagline,
      category: d.category,
      mode: d.mode,
      venue: d.venue,
      city: d.city,
      onlineLink: d.onlineLink || null,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      registrationDeadline: d.registrationDeadline,
      capacity: d.capacity,
      feeInr: d.feeInr,
      prizePool: d.prizePool || null,
      teamSizeMin: d.teamSizeMin,
      teamSizeMax: d.teamSizeMax,
      tags: parseTags(d.tags),
      status: d.status,
      description: d.description,
    })
    .where(and(eq(events.id, eventId), eq(events.organizerId, user.id)))
    .returning({ id: events.id });

  if (result.length === 0) {
    return { error: "Event not found or you do not own it" };
  }

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/my-events");
  revalidatePath("/dashboard");
  redirect(`/events/${eventId}?updated=1`);
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const user = await requireUser();
  if (user.role !== "organizer") {
    return { ok: false, error: "Only organizers can delete events" };
  }
  const result = await db
    .delete(events)
    .where(and(eq(events.id, eventId), eq(events.organizerId, user.id)))
    .returning({ id: events.id });
  if (result.length === 0) {
    return { ok: false, error: "Event not found or you do not own it" };
  }
  revalidatePath("/events");
  revalidatePath("/my-events");
  revalidatePath("/dashboard");
  return { ok: true, message: "Event deleted" };
}

export async function setEventStatus(
  eventId: string,
  status: "draft" | "published" | "cancelled"
): Promise<ActionResult> {
  const user = await requireUser();
  const result = await db
    .update(events)
    .set({ status })
    .where(and(eq(events.id, eventId), eq(events.organizerId, user.id)))
    .returning({ id: events.id });
  if (result.length === 0) {
    return { ok: false, error: "Event not found or you do not own it" };
  }
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/my-events");
  return { ok: true, message: status === "published" ? "Event published" : status === "cancelled" ? "Event cancelled" : "Moved to drafts" };
}
