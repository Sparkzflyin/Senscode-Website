import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getOrderWithDetails } from "@/lib/orders";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  statusLabel,
} from "@/lib/format";
import { ClientMessageForm, OwnerUpdateForm } from "./UpdateForms";
import { ReviewRequestPanel } from "./ReviewRequestPanel";
import { getReviewForOrder } from "@/lib/reviews";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const role = session.user.role ?? "client";

  const data = await getOrderWithDetails(id, {
    id: session.user.id,
    role,
  });
  if (!data) notFound();
  const { order, items, updates } = data;
  const isOwner = role === "owner";

  const review =
    isOwner && order.status === "completed"
      ? await getReviewForOrder(order.id)
      : null;

  const itemTotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0 }}>{order.title}</h1>
            <span className="order-status" data-status={order.status}>
              {statusLabel(order.status)}
            </span>
          </div>
          <p style={{ marginTop: 6 }}>
            {isOwner ? (
              <>
                Client: <strong>{order.clientName || order.clientEmail}</strong>{" "}
                · Created {formatDate(order.createdAt)}
              </>
            ) : (
              <>Created {formatDate(order.createdAt)}</>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {isOwner ? (
            <Link
              href={`/dashboard/orders/${order.id}/edit`}
              className="cta-button small-btn"
            >
              Edit
            </Link>
          ) : null}
          <Link
            href="/dashboard/orders"
            style={{ opacity: 0.7, fontSize: "0.95rem" }}
          >
            ← All orders
          </Link>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        <div className="card glass-panel no-spotlight">
          <span className="tag">Total</span>
          <h2 style={{ fontSize: "1.8rem", marginTop: 8, marginBottom: 0 }}>
            {formatMoney(order.totalCents)}
          </h2>
        </div>
        <div className="card glass-panel no-spotlight">
          <span className="tag">Due</span>
          <h2 style={{ fontSize: "1.3rem", marginTop: 8, marginBottom: 0 }}>
            {formatDate(order.dueDate)}
          </h2>
        </div>
        <div className="card glass-panel no-spotlight">
          <span className="tag">Last update</span>
          <h2 style={{ fontSize: "1.1rem", marginTop: 8, marginBottom: 0 }}>
            {formatDateTime(order.updatedAt)}
          </h2>
        </div>
      </div>

      {order.description ? (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Description</h2>
          <p style={{ whiteSpace: "pre-wrap", opacity: 0.85 }}>
            {order.description}
          </p>
        </section>
      ) : null}

      {items.length > 0 ? (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Line items</h2>
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <strong>{item.description}</strong>
                  {item.quantity !== 1 ? (
                    <span style={{ opacity: 0.7, marginLeft: 8 }}>
                      × {item.quantity}
                    </span>
                  ) : null}
                </div>
                <span>
                  {formatMoney(item.unitPriceCents * item.quantity)}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 16px",
                fontWeight: 600,
              }}
            >
              <span>Line items subtotal</span>
              <span>{formatMoney(itemTotalCents)}</span>
            </div>
          </div>
        </section>
      ) : null}

      {isOwner && order.status === "completed" ? (
        <ReviewRequestPanel orderId={order.id} review={review} />
      ) : null}

      {isOwner && order.notes ? (
        <section
          className="card glass-panel no-spotlight"
          style={{ marginBottom: 32, background: "rgb(255 149 0 / 5%)" }}
        >
          <span className="tag">Internal notes</span>
          <p style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{order.notes}</p>
        </section>
      ) : null}

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: 8 }}>
          {isOwner ? "Post an update" : "Send a message"}
        </h2>
        <p style={{ opacity: 0.7, marginBottom: 16, fontSize: "0.95rem" }}>
          {isOwner
            ? "Add a timeline entry. Optionally change status or mark as internal."
            : "Anything you want Christian to see about this project."}
        </p>
        {isOwner ? (
          <OwnerUpdateForm orderId={order.id} />
        ) : (
          <ClientMessageForm orderId={order.id} />
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1.4rem", marginBottom: 8 }}>Timeline</h2>
        {updates.length === 0 ? (
          <div className="dashboard-empty">
            <p>No updates yet.</p>
          </div>
        ) : (
          <div className="timeline">
            {updates.map((u) => (
              <div
                key={u.id}
                className="timeline-entry"
                data-internal={u.isInternal ? "true" : "false"}
              >
                <div className="timeline-dot" />
                <div>
                  <div className="timeline-meta">
                    <span>{formatDateTime(u.createdAt)}</span>
                    {u.statusChangedTo ? (
                      <span>
                        · status →{" "}
                        <strong>{statusLabel(u.statusChangedTo)}</strong>
                      </span>
                    ) : null}
                    {u.isInternal ? <span>· internal</span> : null}
                  </div>
                  <p className="timeline-message">{u.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
