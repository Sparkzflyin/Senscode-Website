import { requireOwner } from "@/lib/auth";
import { listClients } from "@/lib/orders";
import { formatDate } from "@/lib/format";
import { NewClientForm } from "./NewClientForm";

export default async function ClientsPage() {
  await requireOwner();
  const clients = await listClients();

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Clients</h1>
          <p>Manage who has access to view their projects.</p>
        </div>
      </div>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Add client</h2>
        <NewClientForm />
      </section>

      <section>
        <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>
          All clients ({clients.length})
        </h2>
        {clients.length === 0 ? (
          <div className="dashboard-empty">
            <p>No clients yet. Use the form above to onboard your first.</p>
          </div>
        ) : (
          <div>
            {clients.map((c) => (
              <div key={c.id} className="order-row">
                <div>
                  <strong style={{ fontSize: "1.05rem" }}>
                    {c.name || c.email}
                  </strong>
                  {c.name ? (
                    <div className="order-row-meta">
                      <span>{c.email}</span>
                    </div>
                  ) : null}
                </div>
                <div className="order-row-right">
                  <span style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                    Joined {formatDate(c.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
