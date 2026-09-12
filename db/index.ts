import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.trim()) {
  throw new Error("DATABASE_URL is required. Set it in .env.local or the server environment.");
}

const globalForDatabase = globalThis as typeof globalThis & {
  aftercareSql?: ReturnType<typeof postgres>;
};

// Postgres.js opens connections lazily, when a query is executed.
const client = globalForDatabase.aftercareSql ?? postgres(databaseUrl, {
  // Supabase Transaction Pooler does not support prepared statements.
  prepare: false,
});

// Reuse the pool across Next.js development hot reloads.
if (process.env.NODE_ENV !== "production") {
  globalForDatabase.aftercareSql = client;
}

export const db = drizzle({ client });
