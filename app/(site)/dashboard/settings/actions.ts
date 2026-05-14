"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { updateSiteSettings } from "@/lib/siteSettings";
import type { SiteStatusColor } from "@/db/schema";

const VALID_COLORS: SiteStatusColor[] = ["green", "yellow", "red"];

export type SettingsState = {
  error?: string;
  success?: boolean;
};

export async function updateSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireOwner();

  const rawColor = formData.get("statusColor");
  const rawText = formData.get("statusText");
  const statusText =
    typeof rawText === "string" ? rawText.trim() : "";

  if (typeof rawColor !== "string" || !(VALID_COLORS as string[]).includes(rawColor)) {
    return { error: "Pick a status color." };
  }
  if (!statusText) {
    return { error: "Status text can't be empty." };
  }
  if (statusText.length > 80) {
    return { error: "Status text must be 80 characters or fewer." };
  }

  await updateSiteSettings({
    statusColor: rawColor as SiteStatusColor,
    statusText,
  });

  // The landing page caches the pill — purge it so the new value shows on
  // the next visit.
  revalidatePath("/");
  revalidatePath("/dashboard/settings");
  return { success: true };
}
