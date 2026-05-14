import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { countPendingPosts } from "@/sanity/lib/pending";
import { DashboardNav } from "./DashboardNav";
import { SignOutButton } from "./SignOutButton";
import "./dashboard.css";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const role = session.user.role ?? "client";

  // Only owners get the pending-posts count; non-owners never see that nav item.
  const pendingPostCount = role === "owner" ? await countPendingPosts() : 0;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-user">
          <div className="dashboard-user-name">
            {session.user.name || session.user.email}
          </div>
          <div className="dashboard-user-role">{role}</div>
        </div>
        <DashboardNav role={role} pendingPostCount={pendingPostCount} />
        <SignOutButton />
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
