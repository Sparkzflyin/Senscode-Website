import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import {
  listOrdersForClient,
  listOrdersForOwner,
  type OrderListRow,
} from "@/lib/orders";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";

export default async function OrdersListPage() {
  const session = await requireAuth();
  const isOwner = session.user.role === "owner";
  const rows: OrderListRow[] = isOwner
    ? await listOrdersForOwner()
    : await listOrdersForClient(session.user.id);

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>{isOwner ? "All orders" : "Your orders"}</h1>
          <p>
            {isOwner
              ? "Every order in the system, newest first."
              : "Every project you have w/ SensCode."}
          </p>
        </div>
        {isOwner ? (
          <Link href="/dashboard/orders/new" className="cta-button small-btn">
            + New order
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="dashboard-empty">
          <p>
            {isOwner
              ? "No orders yet. Hit “+ New order” to create your first."
              : "No projects on file yet. Christian will set one up once you’ve agreed on scope."}
          </p>
        </div>
      ) : (
        <div>
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/dashboard/orders/${row.id}`}
              className="order-row"
            >
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <strong style={{ fontSize: "1.05rem" }}>{row.title}</strong>
                  <span className="order-status" data-status={row.status}>
                    {statusLabel(row.status)}
                  </span>
                </div>
                <div className="order-row-meta">
                  {isOwner ? (
                    <span>
                      {row.clientName || row.clientEmail}
                    </span>
                  ) : null}
                  <span>Created {formatDate(row.createdAt)}</span>
                  {row.dueDate ? (
                    <span>Due {formatDate(row.dueDate)}</span>
                  ) : null}
                </div>
              </div>
              <div className="order-row-right">
                <span className="order-row-total">
                  {formatMoney(row.totalCents)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
