"use client";

import { useActionState, useState } from "react";
import {
  deleteClientAction,
  updateClientAction,
  type UpdateClientState,
} from "./actions";

const initialState: UpdateClientState = {};

export function EditClientForm({
  client,
}: {
  client: {
    id: string;
    name: string | null;
    email: string;
    canAuthorBlog: boolean;
  };
}) {
  const action = updateClientAction.bind(null, client.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [resetPassword, setResetPassword] = useState(false);

  return (
    <>
      <form action={formAction}>
        <div className="dashboard-form-grid" style={{ marginBottom: 16 }}>
          <div className="input-group input-floating">
            <input
              id="edit-client-email"
              name="email"
              type="email"
              placeholder=" "
              required
              maxLength={250}
              defaultValue={client.email}
            />
            <label htmlFor="edit-client-email">Email</label>
          </div>
          <div className="input-group input-floating">
            <input
              id="edit-client-name"
              name="name"
              type="text"
              placeholder=" "
              maxLength={120}
              defaultValue={client.name ?? ""}
            />
            <label htmlFor="edit-client-name">Name (optional)</label>
          </div>
        </div>

        <label
          className="form-toggle-group"
          style={{ marginBottom: 12 }}
          htmlFor="edit-client-can-author"
        >
          <input
            id="edit-client-can-author"
            name="canAuthorBlog"
            type="checkbox"
            defaultChecked={client.canAuthorBlog}
          />
          <span>
            Blog permissions — author can post to the blog from their
            dashboard
          </span>
        </label>

        <label
          className="form-toggle-group"
          style={{ marginBottom: 12 }}
          htmlFor="edit-client-reset"
        >
          <input
            id="edit-client-reset"
            name="resetPassword"
            type="checkbox"
            checked={resetPassword}
            onChange={(e) => setResetPassword(e.target.checked)}
          />
          <span>Reset password</span>
        </label>

        {resetPassword ? (
          <div className="input-group input-floating">
            <input
              id="edit-client-password"
              name="password"
              type="text"
              placeholder=" "
              maxLength={120}
              autoComplete="off"
            />
            <label htmlFor="edit-client-password">
              New password (blank = auto-generate)
            </label>
          </div>
        ) : null}

        {state.error ? (
          <p style={{ color: "#ff6b6b", marginBottom: 12 }} role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success && !state.newPassword ? (
          <p style={{ color: "#34d399", marginBottom: 12 }} role="status">
            Saved.
          </p>
        ) : null}

        <button
          type="submit"
          className="cta-button small-btn"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>

      {state.success && state.newPassword ? (
        <div className="client-creds-callout" role="status">
          <strong>New password for {client.email}:</strong>
          <p style={{ margin: "6px 0", opacity: 0.85, fontSize: "0.92rem" }}>
            Copy this now and pass it along — it won&apos;t be shown again.
          </p>
          <code>{state.newPassword}</code>
        </div>
      ) : null}

      <hr
        style={{
          margin: "32px 0 24px",
          border: 0,
          borderTop: "1px solid var(--border)",
        }}
      />

      <DeleteClientButton clientId={client.id} email={client.email} />
    </>
  );
}

function DeleteClientButton({
  clientId,
  email,
}: {
  clientId: string;
  email: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        `Delete ${email}? This permanently removes the account and their login credentials. They must have no orders attached.`,
      )
    ) {
      return;
    }
    setPending(true);
    setError(null);
    const result = await deleteClientAction(clientId);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
    // On success the server action redirects; component unmounts.
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
        {pending ? "Deleting…" : "Delete client"}
      </button>
      {error ? (
        <p style={{ color: "#ff6b6b", marginTop: 10 }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
