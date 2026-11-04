"use client";

import { useEffect } from "react";
import { Database, RefreshCcw, TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbIssue =
    /database/i.test(error.message) ||
    /DATABASE_URL/.test(error.message) ||
    /ECONNREFUSED/.test(error.message) ||
    /relation .* does not exist/i.test(error.message);

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#f6f3ec",
          color: "#171310",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          margin: 0,
        }}
      >
        <div
          style={{
            minHeight: "100dvh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 540,
              borderRadius: 24,
              background: "#fffef9",
              border: "1px solid #e4ddcf",
              padding: 40,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                display: "grid",
                placeItems: "center",
                borderRadius: 16,
                background: "#171310",
                color: "#d9f26e",
              }}
            >
              {isDbIssue ? <Database size={24} /> : <TriangleAlert size={24} />}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 20, letterSpacing: "-0.02em" }}>
              {isDbIssue
                ? "Connect a database to wake Univibe up"
                : "Something snagged"}
            </h1>
            <p style={{ fontSize: 14, color: "#4e473c", lineHeight: 1.6, marginTop: 12 }}>
              {isDbIssue
                ? "The app couldn't reach PostgreSQL. Copy .env.example to .env, set DATABASE_URL, then run: npx drizzle-kit push && npx tsx scripts/seed.ts"
                : error.message || "An unexpected error occurred. Try again."}
            </p>
            <button
              onClick={() => reset()}
              style={{
                marginTop: 24,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                background: "#171310",
                color: "#fffef9",
                border: "none",
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <RefreshCcw size={16} />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
