import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";

/**
 * Database access layer.
 *
 * - If DATABASE_URL is set → real PostgreSQL via node-postgres (prod path).
 * - If DATABASE_URL is NOT set → zero-config embedded PostgreSQL (PGlite,
 *   real Postgres compiled to WASM) persisted to ./.pglite, with the schema
 *   auto-created on first query. `npm run dev` works with zero setup.
 *
 * The `db` export is lazily resolved so importing this module never crashes
 * builds or pages that don't query.
 */

const globalForDb = globalThis as typeof globalThis & {
  __univibePool?: Pool;
  __univibeDb?: NodePgDatabase;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Schema bootstrap for the embedded dev database.
 * Mirrors src/db/schema.ts (quoted snake_case column names).
 */
const EMBEDDED_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "colleges" (
  "id" uuid PRIMARY KEY,
  "name" varchar(160) NOT NULL,
  "short_name" varchar(24) NOT NULL,
  "city" varchar(80) NOT NULL,
  "state" varchar(80) NOT NULL,
  "website" varchar(160),
  "hue" integer DEFAULT 220 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "colleges_city_idx" ON "colleges" ("city");

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(120) NOT NULL,
  "email" varchar(180) NOT NULL,
  "password_hash" text NOT NULL,
  "role" varchar(20) DEFAULT 'student' NOT NULL,
  "college_id" uuid NOT NULL REFERENCES "colleges" ("id"),
  "bio" text,
  "hue" integer DEFAULT 250 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" (lower("email"));

CREATE TABLE IF NOT EXISTS "sessions" (
  "token" varchar(128) PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE cascade,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL
);
CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" ("user_id");

CREATE TABLE IF NOT EXISTS "events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(160) NOT NULL,
  "tagline" varchar(200) DEFAULT '' NOT NULL,
  "description" text NOT NULL,
  "category" varchar(24) NOT NULL,
  "mode" varchar(16) DEFAULT 'in_person' NOT NULL,
  "venue" varchar(180) NOT NULL,
  "city" varchar(80) NOT NULL,
  "online_link" varchar(240),
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone NOT NULL,
  "registration_deadline" timestamp with time zone NOT NULL,
  "capacity" integer DEFAULT 100 NOT NULL,
  "fee_inr" integer DEFAULT 0 NOT NULL,
  "prize_pool" varchar(120),
  "team_size_min" integer DEFAULT 1 NOT NULL,
  "team_size_max" integer DEFAULT 1 NOT NULL,
  "tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "status" varchar(16) DEFAULT 'published' NOT NULL,
  "featured" integer DEFAULT 0 NOT NULL,
  "hue" integer DEFAULT 260 NOT NULL,
  "host_college_id" uuid NOT NULL REFERENCES "colleges" ("id"),
  "organizer_id" uuid NOT NULL REFERENCES "users" ("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "events_category_idx" ON "events" ("category");
CREATE INDEX IF NOT EXISTS "events_start_idx" ON "events" ("starts_at");
CREATE INDEX IF NOT EXISTS "events_host_idx" ON "events" ("host_college_id");
CREATE INDEX IF NOT EXISTS "events_organizer_idx" ON "events" ("organizer_id");

CREATE TABLE IF NOT EXISTS "registrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES "events" ("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE cascade,
  "team_name" varchar(120),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "registrations_event_user_unique" ON "registrations" ("event_id", "user_id");
CREATE INDEX IF NOT EXISTS "registrations_user_idx" ON "registrations" ("user_id");
`;

function createPgDb(): NodePgDatabase {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for the PostgreSQL driver.");
  }
  const pool = globalForDb.__univibePool ?? new Pool({ connectionString: databaseUrl });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__univibePool = pool;
  }
  return drizzleNodePg(pool);
}

function createEmbeddedDb(): NodePgDatabase {
  const dataDir = process.env.PGLITE_DATA_DIR ?? "./.pglite";
  const client = new PGlite(dataDir);
  const initialized = client
    .exec(EMBEDDED_SCHEMA_SQL)
    .catch((err) => {
      console.error("[db] embedded schema bootstrap failed:", err);
      throw err;
    });

  // Route every query through the schema bootstrap first (exactly once).
  const wrapped = new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === "query" || prop === "exec") {
        const original = Reflect.get(target, prop, receiver).bind(target);
        return async (...args: unknown[]) => {
          await initialized;
          return (original as (...a: unknown[]) => unknown)(...args);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[db] DATABASE_URL not set — using embedded PostgreSQL (PGlite) at ./.pglite. " +
        "Set DATABASE_URL in .env to use an external database."
    );
  }
  return drizzlePglite(wrapped) as unknown as NodePgDatabase;
}

function getDb(): NodePgDatabase {
  if (!globalForDb.__univibeDb) {
    globalForDb.__univibeDb = process.env.DATABASE_URL
      ? createPgDb()
      : createEmbeddedDb();
  }
  return globalForDb.__univibeDb;
}

export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
}) as unknown as NodePgDatabase;

/** Direct pg Pool access (only meaningful when DATABASE_URL is set). */
export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    if (!process.env.DATABASE_URL) {
      throw new Error("pg Pool is not available in embedded (PGlite) mode.");
    }
    if (!globalForDb.__univibePool) {
      globalForDb.__univibePool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }
    const instance = globalForDb.__univibePool;
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
