import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const colleges = pgTable(
  "colleges",
  {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    shortName: varchar("short_name", { length: 24 }).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    state: varchar("state", { length: 80 }).notNull(),
    website: varchar("website", { length: 160 }),
    hue: integer("hue").notNull().default(220),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("colleges_city_idx").on(t.city)]
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 180 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("student"), // student | organizer
    collegeId: uuid("college_id")
      .notNull()
      .references(() => colleges.id),
    bio: text("bio"),
    hue: integer("hue").notNull().default(250),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("users_email_unique").on(sql`lower(${t.email})`)]
);

export const sessions = pgTable(
  "sessions",
  {
    token: varchar("token", { length: 128 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 160 }).notNull(),
    tagline: varchar("tagline", { length: 200 }).notNull().default(""),
    description: text("description").notNull(),
    category: varchar("category", { length: 24 }).notNull(), // hackathon | cultural | sports | workshop | tech_talk | fest
    mode: varchar("mode", { length: 16 }).notNull().default("in_person"), // in_person | online | hybrid
    venue: varchar("venue", { length: 180 }).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    onlineLink: varchar("online_link", { length: 240 }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    registrationDeadline: timestamp("registration_deadline", {
      withTimezone: true,
    }).notNull(),
    capacity: integer("capacity").notNull().default(100),
    feeInr: integer("fee_inr").notNull().default(0),
    prizePool: varchar("prize_pool", { length: 120 }),
    teamSizeMin: integer("team_size_min").notNull().default(1),
    teamSizeMax: integer("team_size_max").notNull().default(1),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    status: varchar("status", { length: 16 }).notNull().default("published"), // draft | published | cancelled
    featured: integer("featured").notNull().default(0),
    hue: integer("hue").notNull().default(260),
    hostCollegeId: uuid("host_college_id")
      .notNull()
      .references(() => colleges.id),
    organizerId: uuid("organizer_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("events_category_idx").on(t.category),
    index("events_start_idx").on(t.startsAt),
    index("events_host_idx").on(t.hostCollegeId),
    index("events_organizer_idx").on(t.organizerId),
  ]
);

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamName: varchar("team_name", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("registrations_event_user_unique").on(t.eventId, t.userId),
    index("registrations_user_idx").on(t.userId),
  ]
);

export type College = typeof colleges.$inferSelect;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
