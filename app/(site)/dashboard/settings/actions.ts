"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/siteSettings";
import type { SiteStatusColor, SiteStatusMode } from "@/db/schema";

const VALID_COLORS: SiteStatusColor[] = ["green", "yellow", "red"];
const VALID_MODES: SiteStatusMode[] = ["manual", "auto"];

export type SettingsState = {
  error?: string;
  success?: boolean;
};

export async function updateSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireOwner();

  const rawMode = formData.get("statusMode");
  const rawColor = formData.get("statusColor");
  const rawText = formData.get("statusText");
  const statusText = typeof rawText === "string" ? rawText.trim() : "";

  if (
    typeof rawMode !== "string" ||
    !(VALID_MODES as string[]).includes(rawMode)
  ) {
    return { error: "Pick a mode." };
  }

  const statusMode = rawMode as SiteStatusMode;
  // Manual-mode color/text fields are disabled (and therefore not submitted)
  // when the form is in auto mode. Preserve whatever's stored so toggling
  // to auto and back doesn't wipe the owner's previous manual values.
  const current = await getSiteSettings();

  let nextColor: SiteStatusColor = current.statusColor;
  let nextText: string = current.statusText;

  if (statusMode === "manual") {
    if (
      typeof rawColor !== "string" ||
      !(VALID_COLORS as string[]).includes(rawColor)
    ) {
      return { error: "Pick a status color." };
    }
    if (!statusText) {
      return { error: "Status text can't be empty." };
    }
    if (statusText.length > 80) {
      return { error: "Status text must be 80 characters or fewer." };
    }
    nextColor = rawColor as SiteStatusColor;
    nextText = statusText;
  }

  await updateSiteSettings({
    statusMode,
    statusColor: nextColor,
    statusText: nextText,
  });

  revalidatePath("/");
  revalidatePath("/dashboard/settings");
  return { success: true };
}
