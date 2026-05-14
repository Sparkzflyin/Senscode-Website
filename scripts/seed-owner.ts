// Run with: npm run seed:owner
//
// Reads OWNER_EMAIL + OWNER_PASSWORD from .env.local, hashes the password,
// and inserts (or updates) a single user row with role='owner'. Safe to run
// multiple times — re-running updates the password.

import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { users } from "../db/schema";

async function main() {
  const email = process.env.OWNER_EMAIL?.toLowerCase().trim();
  const password = process.env.OWNER_PASSWORD;

  if (!email || !password) {
    console.error(
      "Missing OWNER_EMAIL or OWNER_PASSWORD. Add them to .env.local and try again.",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("OWNER_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const db = getDb();

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, role: "owner" })
      .where(eq(users.id, existing.id));
    console.log(`Updated existing user ${email} → role=owner, password reset.`);
  } else {
    await db.insert(users).values({
      email,
      passwordHash,
      role: "owner",
      name: "Christian Sparks",
    });
    console.log(`Created owner ${email}.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
