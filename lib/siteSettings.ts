import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  siteSettings,
  type SiteSettings,
  type SiteStatusColor,
} from "@/db/schema";

const SETTINGS_ID = "singleton";

const DEFAULT_SETTINGS: SiteSettings = {
  id: SETTINGS_ID,
  statusColor: "green",
  statusText: "Accepting Booking Until June",
  updatedAt: new Date(0),
};

// Read-your-own-or-create. The settings row is a singleton — first reader
// inserts it with schema defaults, every subsequent call sees a real row.
// Falls back to in-memory defaults if the table doesn't exist yet (pre-
// db:push) or the DB is unreachable — the landing page should never 500
// for a missing config knob.
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const db = getDb();
    const [existing] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, SETTINGS_ID))
      .limit(1);

    if (existing) return existing;

    const [created] = await db
      .insert(siteSettings)
      .values({ id: SETTINGS_ID })
      .returning();
    return created;
  } catch (err) {
    console.warn("[siteSettings] falling back to defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(input: {
  statusColor: SiteStatusColor;
  statusText: string;
}): Promise<SiteSettings> {
  const db = getDb();

  // Ensure the row exists before we update so we never miss the upsert.
  await getSiteSettings();

  const [updated] = await db
    .update(siteSettings)
    .set({
      statusColor: input.statusColor,
      statusText: input.statusText,
    })
    .where(eq(siteSettings.id, SETTINGS_ID))
    .returning();
  return updated;
}
