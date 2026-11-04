import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  ne,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import { colleges, events, registrations, users } from "@/db/schema";
import type { EventCardData } from "@/lib/types";

export async function countRegistrations(eventIds: string[]) {
  if (eventIds.length === 0) return new Map<string, number>();
  const rows = await db
    .select({ eventId: registrations.eventId, n: count() })
    .from(registrations)
    .where(inArray(registrations.eventId, eventIds))
    .groupBy(registrations.eventId);
  return new Map(rows.map((r) => [r.eventId, r.n]));
}

export async function myRegistrationEventIds(userId: string, eventIds: string[]) {
  if (eventIds.length === 0) return new Set<string>();
  const rows = await db
    .select({ eventId: registrations.eventId })
    .from(registrations)
    .where(
      and(eq(registrations.userId, userId), inArray(registrations.eventId, eventIds))
    );
  return new Set(rows.map((r) => r.eventId));
}

export type EventFilter = {
  q?: string;
  category?: string;
  mode?: string;
  collegeId?: string;
  when?: "upcoming" | "past" | "all";
  organizerId?: string;
  userId?: string; // for isRegistered flag
  includeDrafts?: boolean;
  limit?: number;
  order?: "date" | "popular";
};

export async function getEvents(filter: EventFilter = {}): Promise<EventCardData[]> {
  const conditions = [];
  if (!filter.includeDrafts) conditions.push(eq(events.status, "published"));
  if (filter.organizerId) conditions.push(eq(events.organizerId, filter.organizerId));
  if (filter.category) conditions.push(eq(events.category, filter.category));
  if (filter.mode) conditions.push(eq(events.mode, filter.mode));
  if (filter.collegeId) conditions.push(eq(events.hostCollegeId, filter.collegeId));
  if (filter.when === "past") conditions.push(lt(events.startsAt, new Date()));
  if (filter.when === "upcoming" || !filter.when) {
    if (!filter.organizerId) conditions.push(gte(events.startsAt, new Date()));
  }
  if (filter.q) {
    const like = `%${filter.q}%`;
    conditions.push(
      or(
        ilike(events.title, like),
        ilike(events.tagline, like),
        ilike(events.description, like),
        ilike(colleges.name, like),
        sql`exists (select 1 from unnest(${events.tags}) t(tag) where t.tag ilike ${like})`
      )
    );
  }

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      tagline: events.tagline,
      category: events.category,
      mode: events.mode,
      city: events.city,
      venue: events.venue,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      registrationDeadline: events.registrationDeadline,
      capacity: events.capacity,
      feeInr: events.feeInr,
      prizePool: events.prizePool,
      tags: events.tags,
      status: events.status,
      featured: events.featured,
      hue: events.hue,
      organizerId: events.organizerId,
      hostCollegeId: events.hostCollegeId,
      hostName: colleges.name,
      hostShortName: colleges.shortName,
    })
    .from(events)
    .innerJoin(colleges, eq(colleges.id, events.hostCollegeId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      filter.when === "past" ? desc(events.startsAt) : asc(events.startsAt)
    )
    .limit(filter.limit ?? 200);

  const ids = rows.map((r) => r.id);
  const counts = await countRegistrations(ids);
  const mine = filter.userId
    ? await myRegistrationEventIds(filter.userId, ids)
    : new Set<string>();

  let cards: EventCardData[] = rows.map((r) => ({
    ...r,
    registered: counts.get(r.id) ?? 0,
    isRegistered: mine.has(r.id),
  }));

  if (filter.order === "popular") {
    cards = cards.sort((a, b) => b.registered - a.registered);
  }
  if (filter.limit && filter.order === "popular") {
    cards = cards.slice(0, filter.limit);
  }
  return cards;
}

export async function getEventDetail(eventId: string, userId?: string) {
  const rows = await db
    .select({
      event: events,
      host: {
        id: colleges.id,
        name: colleges.name,
        shortName: colleges.shortName,
        city: colleges.city,
        state: colleges.state,
        website: colleges.website,
        hue: colleges.hue,
      },
      organizerName: users.name,
    })
    .from(events)
    .innerJoin(colleges, eq(colleges.id, events.hostCollegeId))
    .innerJoin(users, eq(users.id, events.organizerId))
    .where(eq(events.id, eventId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const [regCount] = await db
    .select({ n: count() })
    .from(registrations)
    .where(eq(registrations.eventId, eventId));

  let isRegistered = false;
  let mine: string | null = null;
  if (userId) {
    const existing = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(
        and(eq(registrations.eventId, eventId), eq(registrations.userId, userId))
      )
      .limit(1);
    isRegistered = existing.length > 0;
    mine = existing[0]?.id ?? null;
  }

  return {
    ...row,
    registered: regCount?.n ?? 0,
    isRegistered,
    myRegistrationId: mine,
  };
}

export async function getEventAttendees(eventId: string) {
  return db
    .select({
      id: registrations.id,
      createdAt: registrations.createdAt,
      userName: users.name,
      userHue: users.hue,
      userEmail: users.email,
      collegeShortName: colleges.shortName,
    })
    .from(registrations)
    .innerJoin(users, eq(users.id, registrations.userId))
    .innerJoin(colleges, eq(colleges.id, users.collegeId))
    .where(eq(registrations.eventId, eventId))
    .orderBy(desc(registrations.createdAt))
    .limit(60);
}

export async function getMyRegistrations(userId: string) {
  const rows = await db
    .select({
      registrationId: registrations.id,
      registeredAt: registrations.createdAt,
      id: events.id,
      title: events.title,
      tagline: events.tagline,
      category: events.category,
      mode: events.mode,
      city: events.city,
      venue: events.venue,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      registrationDeadline: events.registrationDeadline,
      capacity: events.capacity,
      feeInr: events.feeInr,
      prizePool: events.prizePool,
      tags: events.tags,
      status: events.status,
      featured: events.featured,
      hue: events.hue,
      organizerId: events.organizerId,
      hostCollegeId: events.hostCollegeId,
      hostName: colleges.name,
      hostShortName: colleges.shortName,
    })
    .from(registrations)
    .innerJoin(events, eq(events.id, registrations.eventId))
    .innerJoin(colleges, eq(colleges.id, events.hostCollegeId))
    .where(eq(registrations.userId, userId))
    .orderBy(asc(events.startsAt));

  const ids = rows.map((r) => r.id);
  const counts = await countRegistrations(ids);
  return {
    upcoming: rows
      .filter((r) => new Date(r.startsAt) >= new Date())
      .map((r) => ({ ...r, registered: counts.get(r.id) ?? 0 })),
    past: rows
      .filter((r) => new Date(r.startsAt) < new Date())
      .map((r) => ({ ...r, registered: counts.get(r.id) ?? 0 })),
  };
}

export async function getCollegesWithStats() {
  const eventCounts = db
    .select({
      id: events.hostCollegeId,
      n: count().as("event_n"),
    })
    .from(events)
    .where(eq(events.status, "published"))
    .groupBy(events.hostCollegeId)
    .as("event_counts");

  const studentCounts = db
    .select({
      id: users.collegeId,
      n: count().as("student_n"),
    })
    .from(users)
    .groupBy(users.collegeId)
    .as("student_counts");

  return db
    .select({
      id: colleges.id,
      name: colleges.name,
      shortName: colleges.shortName,
      city: colleges.city,
      state: colleges.state,
      website: colleges.website,
      hue: colleges.hue,
      eventsCount: sql<number>`coalesce(${eventCounts.n}, 0)`,
      studentsCount: sql<number>`coalesce(${studentCounts.n}, 0)`,
    })
    .from(colleges)
    .leftJoin(eventCounts, eq(eventCounts.id, colleges.id))
    .leftJoin(studentCounts, eq(studentCounts.id, colleges.id))
    .orderBy(desc(sql`coalesce(${eventCounts.n}, 0)`), asc(colleges.name));
}

export async function getAllColleges() {
  return db.select().from(colleges).orderBy(asc(colleges.name));
}

export async function getCollegeById(id: string) {
  const rows = await db.select().from(colleges).where(eq(colleges.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getPlatformStats() {
  const [e] = await db
    .select({ n: count() })
    .from(events)
    .where(eq(events.status, "published"));
  const [c] = await db.select({ n: count() }).from(colleges);
  const [r] = await db.select({ n: count() }).from(registrations);
  const [u] = await db.select({ n: count() }).from(users);
  return {
    events: e?.n ?? 0,
    colleges: c?.n ?? 0,
    registrations: r?.n ?? 0,
    users: u?.n ?? 0,
  };
}

export async function getCategoryCounts() {
  const rows = await db
    .select({ category: events.category, n: count() })
    .from(events)
    .where(and(eq(events.status, "published"), gte(events.startsAt, new Date())))
    .groupBy(events.category);
  return new Map(rows.map((r) => [r.category, r.n]));
}

export async function getOrganizerStats(organizerId: string) {
  const mine = await db
    .select({ id: events.id, startsAt: events.startsAt })
    .from(events)
    .where(and(eq(events.organizerId, organizerId), ne(events.status, "cancelled")));
  const ids = mine.map((m) => m.id);
  let totalRegistrations = 0;
  if (ids.length > 0) {
    const [r] = await db
      .select({ n: count() })
      .from(registrations)
      .where(inArray(registrations.eventId, ids));
    totalRegistrations = r?.n ?? 0;
  }
  const now = new Date();
  return {
    totalEvents: mine.length,
    upcomingEvents: mine.filter((m) => new Date(m.startsAt) >= now).length,
    totalRegistrations,
  };
}
