import { requireAuth } from "@/lib/auth";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function AccountPage() {
  const session = await requireAuth();
  const role = session.user.role ?? "client";

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Account</h1>
          <p>Manage how you sign in.</p>
        </div>
      </div>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Profile</h2>
        <div className="order-row" style={{ cursor: "default" }}>
          <div>
            <strong style={{ fontSize: "1.05rem" }}>
              {session.user.name || session.user.email}
            </strong>
            <div className="order-row-meta">
              <span>{session.user.email}</span>
              <span>· role: {role}</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>
          Change password
        </h2>
        <ChangePasswordForm />
      </section>
    </>
  );
}
