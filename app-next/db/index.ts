import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let cached: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached;
  // Vercel Neon integration ships the connection string as SENSSTORAGE_URL
  // (the custom prefix we set in the integration UI).
  const url = process.env.SENSSTORAGE_URL;
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
