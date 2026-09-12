import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Drizzle Kit runs outside Next.js, so load local variables explicitly.
// Existing process environment variables retain precedence.
config({ path: ".env.local", quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.trim()) {
  throw new Error("DATABASE_URL is required. Set it in .env.local or the server environment.");
}

export default defineConfig({
  dialect: "postgresql",
  out: "./db/migrations",
  // Add schema paths when domain schemas are implemented.
  dbCredentials: { url: databaseUrl },
});
