import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let cached: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached;
  // Vercel Neon integration ships pooled URLs under SENSSTORAGE_DATABASE_URL
  // (auto-set by the integration). Local .env.local uses SENSSTORAGE_URL.
  const url =
    process.env.SENSSTORAGE_URL || process.env.SENSSTORAGE_DATABASE_URL;
  if (!url) {
    throw new Error(
      "SENSSTORAGE_URL is not set — add it to .env.local. See .env.example.",
    );
  }
  const sql = neon(url);
  cached = drizzle(sql, { schema });
  return cached;
}

export { schema };
