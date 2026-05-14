import { requireOwner } from "@/lib/auth";
import { getSiteSettings } from "@/lib/siteSettings";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  await requireOwner();
  const settings = await getSiteSettings();

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
          initialColor={settings.statusColor}
          initialText={settings.statusText}
        />
      </section>
    </>
  );
}
