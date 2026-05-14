"use client";

import { useActionState } from "react";
import { createOrderAction, type CreateOrderState } from "./actions";

const initialState: CreateOrderState = {};

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

export function NewOrderForm({
  clients,
}: {
  clients: Array<{ id: string; name: string | null; email: string }>;
}) {
  const [state, formAction, pending] = useActionState(
    createOrderAction,
    initialState,
  );

  return (
    <form action={formAction} id="contact-form">
      <div className="input-group input-floating">
        <input
          id="order-title"
          name="title"
          type="text"
          placeholder=" "
          required
          maxLength={200}
        />
        <label htmlFor="order-title">Title</label>
      </div>

      <div className="input-group input-floating">
        <textarea
          id="order-description"
          name="description"
          placeholder=" "
          rows={3}
          maxLength={2000}
        />
        <label htmlFor="order-description">Description (optional)</label>
      </div>

      <div className="dashboard-form-grid" style={{ marginBottom: 16 }}>
        <div className="input-group input-floating has-value">
          <select id="order-client" name="clientId" required defaultValue="">
            <option value="" disabled hidden></option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name ? `${c.name} (${c.email})` : c.email}
              </option>
            ))}
          </select>
          <label htmlFor="order-client">Client</label>
        </div>

        <div className="input-group input-floating has-value">
          <select id="order-status" name="status" defaultValue="new">
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <label htmlFor="order-status">Status</label>
        </div>
      </div>

      <div className="dashboard-form-grid" style={{ marginBottom: 16 }}>
        <div className="input-group input-floating">
          <input
            id="order-total"
            name="total"
            type="number"
            min="0"
            step="0.01"
            placeholder=" "
          />
          <label htmlFor="order-total">Total ($)</label>
        </div>

        <div className="input-group input-floating">
          <input id="order-due" name="dueDate" type="date" placeholder=" " />
          <label htmlFor="order-due">Due date</label>
        </div>
      </div>

      <div className="input-group input-floating">
        <textarea
          id="order-notes"
          name="notes"
          placeholder=" "
          rows={3}
          maxLength={2000}
        />
        <label htmlFor="order-notes">Internal notes (client never sees these)</label>
      </div>

      {state.error ? (
        <p style={{ color: "#ff6b6b", marginBottom: 16 }} role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="cta-button" disabled={pending}>
        {pending ? "Creating…" : "Create order"}
      </button>
    </form>
  );
}
