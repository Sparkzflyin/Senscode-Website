import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  siteSettings,
  orders,
  type SiteSettings,
  type SiteStatusColor,
  type SiteStatusMode,
} from "@/db/schema";

const SETTINGS_ID = "singleton";

const DEFAULT_SETTINGS: SiteSettings = {
  id: SETTINGS_ID,
  statusMode: "manual",
  statusColor: "green",
  statusText: "Accepting Booking Until June",
  updatedAt: new Date(0),
};

// Auto-mode thresholds: active order count → resolved pill. Labels lean
// optimistic so even "full" still invites a conversation.
const AUTO_THRESHOLDS: Array<{
  maxActive: number;
  color: SiteStatusColor;
  text: string;
}> = [
  { maxActive: 2, color: "green", text: "Accepting new projects" },
  { maxActive: 4, color: "yellow", text: "Limited capacity — book early" },
  { maxActive: Infinity, color: "red", text: "Fully booked — join waitlist" },
];

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
  statusMode: SiteStatusMode;
  statusColor: SiteStatusColor;
  statusText: string;
}): Promise<SiteSettings> {
  const db = getDb();

  await getSiteSettings();

  const [updated] = await db
    .update(siteSettings)
    .set({
      statusMode: input.statusMode,
      statusColor: input.statusColor,
      statusText: input.statusText,
    })
    .where(eq(siteSettings.id, SETTINGS_ID))
    .returning();
  return updated;
}

export type ResolvedSiteStatus = {
  color: SiteStatusColor;
  text: string;
  mode: SiteStatusMode;
  activeOrderCount?: number;
};

// Resolves the pill to display on the public site. In manual mode, returns
// the stored color/text verbatim. In auto mode, derives from active order
// load and ignores the stored color/text.
export async function getResolvedSiteStatus(): Promise<ResolvedSiteStatus> {
  const settings = await getSiteSettings();

  if (settings.statusMode === "manual") {
    return {
      color: settings.statusColor,
      text: settings.statusText,
      mode: "manual",
    };
  }

  let activeOrderCount = 0;
  try {
    const db = getDb();
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(sql`${orders.status} in ('new', 'in_progress', 'review')`);
    activeOrderCount = row?.count ?? 0;
  } catch (err) {
    console.warn("[siteSettings] auto-status fallback:", err);
  }

  const bucket =
    AUTO_THRESHOLDS.find((t) => activeOrderCount <= t.maxActive) ??
    AUTO_THRESHOLDS[AUTO_THRESHOLDS.length - 1];

  return {
    color: bucket.color,
    text: bucket.text,
    mode: "auto",
    activeOrderCount,
  };
}
