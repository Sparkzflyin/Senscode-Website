import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit doesn't auto-load .env.local the way Next does, so we pull it
// in manually before reading the connection string.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SENSSTORAGE_URL || "",
  },
  verbose: true,
  strict: true,
});
