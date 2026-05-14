"use client";

import { useActionState } from "react";
import {
  createClientAction,
  type CreateClientState,
} from "./actions";

const initialState: CreateClientState = {};

export function NewClientForm() {
  const [state, formAction, pending] = useActionState(
    createClientAction,
    initialState,
  );

  return (
    <>
      <form action={formAction} key={state.generatedPassword ? "reset" : "form"}>
        <div className="dashboard-form-grid" style={{ marginBottom: 16 }}>
          <div className="input-group input-floating">
            <input
              id="client-email"
              name="email"
              type="email"
              placeholder=" "
              required
              maxLength={250}
            />
            <label htmlFor="client-email">Email</label>
          </div>
          <div className="input-group input-floating">
            <input
              id="client-name"
              name="name"
              type="text"
              placeholder=" "
              maxLength={120}
            />
            <label htmlFor="client-name">Name (optional)</label>
          </div>
        </div>

        <div className="input-group input-floating">
          <input
            id="client-password"
            name="password"
            type="text"
            placeholder=" "
            maxLength={120}
            autoComplete="off"
          />
          <label htmlFor="client-password">
            Password (leave blank to auto-generate)
          </label>
        </div>

        <label
          className="form-toggle-group"
          style={{ marginBottom: 16 }}
          htmlFor="client-can-author"
        >
          <input
            id="client-can-author"
            name="canAuthorBlog"
            type="checkbox"
          />
          <span>
            Blog permissions — this user will see a &ldquo;Create new
            post&rdquo; button on their dashboard
          </span>
        </label>

        {state.error ? (
          <p style={{ color: "#ff6b6b", marginBottom: 12 }} role="alert">
            {state.error}
          </p>
        ) : null}

        <button type="submit" className="cta-button small-btn" disabled={pending}>
          {pending ? "Creating…" : "Create client"}
        </button>
      </form>

      {state.generatedPassword && state.createdEmail ? (
        <div className="client-creds-callout" role="status">
          <strong>Account created for {state.createdEmail}.</strong>
          <p style={{ margin: "6px 0", opacity: 0.85, fontSize: "0.92rem" }}>
            Copy this password now and share it w/ the client through whatever
            channel you trust. <strong>It won&apos;t be shown again</strong> —
            you&apos;d have to reset their password from the database if it&apos;s lost.
          </p>
          <code>{state.generatedPassword}</code>
        </div>
      ) : null}
    </>
  );
}
