import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth();
  const isOwner = session.user.role === "owner";

  return (
    <section className="panel" style={{ paddingTop: "clamp(80px, 12vh, 160px)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <span className="tag">{isOwner ? "Owner" : "Client"}</span>
        <h1 style={{ marginTop: 12 }}>
          Welcome{session.user.name ? `, ${session.user.name}` : ""}.
        </h1>

        {isOwner ? (
          <div className="card glass-panel no-spotlight" style={{ marginTop: 32 }}>
            <h3>Owner dashboard</h3>
            <p className="card-desc">
              Order management lands in Phase 4 — for now this is just the
              auth check. From here you&apos;ll create client accounts, view
              every order, post status updates, and run the books.
            </p>
          </div>
        ) : (
          <div className="card glass-panel no-spotlight" style={{ marginTop: 32 }}>
            <h3>Your projects</h3>
            <p className="card-desc">
              No active projects yet. Once Christian kicks off an order for
              you it&apos;ll appear here with status, deliverables, and a
              timeline.
            </p>
          </div>
        )}

        <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
          <SignOutButton />
        </div>
      </div>
    </section>
  );
}
