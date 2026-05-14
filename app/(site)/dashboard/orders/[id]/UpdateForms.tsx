"use client";

import { useActionState } from "react";
import {
  postClientMessageAction,
  postUpdateAction,
  type UpdateState,
} from "./actions";

const STATUS_OPTIONS = [
  { value: "", label: "— don't change —" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

export function OwnerUpdateForm({ orderId }: { orderId: string }) {
  const action = postUpdateAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState<UpdateState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} key={state.success ? "reset" : "form"}>
      <div className="input-group input-floating">
        <textarea
          id="update-message"
          name="message"
          placeholder=" "
          rows={3}
          required
          maxLength={2000}
        />
        <label htmlFor="update-message">Update message</label>
      </div>

      <div className="dashboard-form-grid" style={{ marginBottom: 16 }}>
        <div className="input-group input-floating has-value">
          <select id="update-status" name="status" defaultValue="">
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <label htmlFor="update-status">Change status?</label>
        </div>

        <label
          className="form-toggle-group"
          style={{ alignSelf: "center" }}
          htmlFor="update-internal"
        >
          <input id="update-internal" name="internal" type="checkbox" />
          <span>Internal only (client doesn’t see)</span>
        </label>
      </div>

      {state.error ? (
        <p style={{ color: "#ff6b6b", marginBottom: 12 }} role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p style={{ color: "#34d399", marginBottom: 12 }} role="status">
          Update posted.
        </p>
      ) : null}

      <button type="submit" className="cta-button small-btn" disabled={pending}>
        {pending ? "Posting…" : "Post update"}
      </button>
    </form>
  );
}

export function ClientMessageForm({ orderId }: { orderId: string }) {
  const action = postClientMessageAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState<UpdateState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} key={state.success ? "reset" : "form"}>
      <div className="input-group input-floating">
        <textarea
          id="client-message"
          name="message"
          placeholder=" "
          rows={3}
          required
          maxLength={2000}
        />
        <label htmlFor="client-message">Send Christian a note</label>
      </div>

      {state.error ? (
        <p style={{ color: "#ff6b6b", marginBottom: 12 }} role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p style={{ color: "#34d399", marginBottom: 12 }} role="status">
          Sent.
        </p>
      ) : null}

      <button type="submit" className="cta-button small-btn" disabled={pending}>
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
