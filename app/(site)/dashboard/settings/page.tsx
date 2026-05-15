import { requireOwner } from "@/lib/auth";
import { getSiteSettings, getResolvedSiteStatus } from "@/lib/siteSettings";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  await requireOwner();
  const [settings, resolved] = await Promise.all([
    getSiteSettings(),
    getResolvedSiteStatus(),
  ]);

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Site settings</h1>
          <p>Controls the availability pill on the landing page.</p>
        </div>
      </div>

      <section style={{ maxWidth: 640 }}>
        <SettingsForm
          initialMode={settings.statusMode}
          initialColor={settings.statusColor}
          initialText={settings.statusText}
          autoPreviewColor={resolved.mode === "auto" ? resolved.color : null}
          autoPreviewText={resolved.mode === "auto" ? resolved.text : null}
          autoActiveCount={resolved.activeOrderCount ?? 0}
        />
      </section>
    </>
  );
}
