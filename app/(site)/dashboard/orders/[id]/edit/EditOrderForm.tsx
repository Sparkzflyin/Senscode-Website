"use client";

import { useActionState, useState } from "react";
import {
  deleteOrderAction,
  updateOrderAction,
  type EditOrderState,
} from "../actions";

const initialState: EditOrderState = {};

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

type OrderForEdit = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  totalCents: number;
  dueDate: Date | null;
  notes: string | null;
  clientId: string;
};

export function EditOrderForm({
  order,
  clients,
}: {
  order: OrderForEdit;
  clients: Array<{ id: string; name: string | null; email: string }>;
}) {
  const action = updateOrderAction.bind(null, order.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  const totalDollars = (order.totalCents / 100).toFixed(2);
  const dueDateValue = order.dueDate
    ? order.dueDate.toISOString().slice(0, 10)
    : "";

  return (
    <>
      <form action={formAction} id="contact-form">
        <div className="input-group input-floating">
          <input
            id="edit-order-title"
            name="title"
            type="text"
            placeholder=" "
            required
            maxLength={200}
            defaultValue={order.title}
          />
          <label htmlFor="edit-order-title">Title</label>
        </div>

        <div className="input-group input-floating">
          <textarea
            id="edit-order-description"
            name="description"
            placeholder=" "
            rows={3}
            maxLength={2000}
            defaultValue={order.description ?? ""}
          />
          <label htmlFor="edit-order-description">Description (optional)</label>
        </div>

        <div className="dashboard-form-grid" style={{ marginBottom: 16 }}>
          <div className="input-group input-floating has-value">
            <select
              id="edit-order-client"
              name="clientId"
              required
              defaultValue={order.clientId}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ? `${c.name} (${c.email})` : c.email}
                </option>
              ))}
            </select>
            <label htmlFor="edit-order-client">Client</label>
          </div>

          <div className="input-group input-floating has-value">
            <select
              id="edit-order-status"
              name="status"
              defaultValue={order.status}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <label htmlFor="edit-order-status">Status</label>
          </div>
        </div>

        <div className="dashboard-form-grid" style={{ marginBottom: 16 }}>
          <div className="input-group input-floating">
            <input
              id="edit-order-total"
              name="total"
              type="number"
              min="0"
              step="0.01"
              placeholder=" "
              defaultValue={totalDollars}
            />
            <label htmlFor="edit-order-total">Total ($)</label>
          </div>

          <div className="input-group input-floating">
            <input
              id="edit-order-due"
              name="dueDate"
              type="date"
              placeholder=" "
              defaultValue={dueDateValue}
            />
            <label htmlFor="edit-order-due">Due date</label>
          </div>
        </div>

        <div className="input-group input-floating">
          <textarea
            id="edit-order-notes"
            name="notes"
            placeholder=" "
            rows={3}
            maxLength={2000}
            defaultValue={order.notes ?? ""}
          />
          <label htmlFor="edit-order-notes">
            Internal notes (client never sees these)
          </label>
        </div>

        {state.error ? (
          <p style={{ color: "#ff6b6b", marginBottom: 16 }} role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p style={{ color: "#34d399", marginBottom: 16 }} role="status">
            Saved.
          </p>
        ) : null}

        <button type="submit" className="cta-button" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>

      <hr
        style={{
          margin: "32px 0 24px",
          border: 0,
          borderTop: "1px solid var(--border)",
        }}
      />

      <DeleteOrderButton orderId={order.id} title={order.title} />
    </>
  );
}

function DeleteOrderButton({
  orderId,
  title,
}: {
  orderId: string;
  title: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        `Delete "${title}"? This wipes the order, its line items, and its full timeline. Cannot be undone.`,
      )
    ) {
      return;
    }
    setPending(true);
    setError(null);
    const result = await deleteOrderAction(orderId);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div>
      <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Danger zone</h3>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="danger-btn"
      >
        {pending ? "Deleting…" : "Delete order"}
      </button>
      {error ? (
        <p style={{ color: "#ff6b6b", marginTop: 10 }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
