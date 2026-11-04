"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { isPast } from "date-fns";

import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

export async function registerForEvent(eventId: string): Promise<ActionResult> {
  const user = await requireUser();

  const rows = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  const event = rows[0];
  if (!event) return { ok: false, error: "Event not found" };
  if (event.status !== "published")
    return { ok: false, error: "This event is not open for registration" };
  if (isPast(new Date(event.registrationDeadline)))
    return { ok: false, error: "Registration has closed for this event" };
  if (event.organizerId === user.id)
    return { ok: false, error: "You are organizing this event" };

  const existing = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(
      and(eq(registrations.eventId, eventId), eq(registrations.userId, user.id))
    )
    .limit(1);
  if (existing.length > 0) return { ok: true, message: "Already registered" };

  const [c] = await db
    .select({ n: count() })
    .from(registrations)
    .where(eq(registrations.eventId, eventId));
  if ((c?.n ?? 0) >= event.capacity) {
    return { ok: false, error: "This event just filled up" };
  }

  try {
    await db.insert(registrations).values({ eventId, userId: user.id });
  } catch {
    return { ok: false, error: "Could not register. Try again." };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/registrations");
  revalidatePath("/dashboard");
  return { ok: true, message: "You're in! Seat reserved." };
}

export async function cancelRegistration(eventId: string): Promise<ActionResult> {
  const user = await requireUser();
  const rows = await db
    .delete(registrations)
    .where(
      and(eq(registrations.eventId, eventId), eq(registrations.userId, user.id))
    )
    .returning({ id: registrations.id });
  if (rows.length === 0) return { ok: false, error: "Registration not found" };
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/registrations");
  revalidatePath("/dashboard");
  return { ok: true, message: "Registration cancelled" };
}

export async function getClosingSoonCount(userId: string) {
  const now = new Date();
  const rows = await db
    .select({ n: count() })
    .from(registrations)
    .innerJoin(events, eq(events.id, registrations.eventId))
    .where(
      and(
        eq(registrations.userId, userId),
        gte(events.registrationDeadline, now),
        lt(events.registrationDeadline, new Date(now.getTime() + 72 * 3600 * 1000))
      )
    );
  return rows[0]?.n ?? 0;
}
