"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the inputs after a successful save so nothing's lingering in the
  // DOM. The success banner stays visible until the next submit.
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <form action={formAction} ref={formRef}>
      <div className="input-group input-floating">
        <input
          id="account-current"
          name="currentPassword"
          type="password"
          placeholder=" "
          autoComplete="current-password"
          required
          maxLength={120}
        />
        <label htmlFor="account-current">Current password</label>
      </div>

      <div className="input-group input-floating">
        <input
          id="account-new"
          name="newPassword"
          type="password"
          placeholder=" "
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={120}
        />
        <label htmlFor="account-new">New password (min 8 chars)</label>
      </div>

      <div className="input-group input-floating">
        <input
          id="account-confirm"
          name="confirmPassword"
          type="password"
          placeholder=" "
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={120}
        />
        <label htmlFor="account-confirm">Confirm new password</label>
      </div>

      {state.error ? (
        <p style={{ color: "#ff6b6b", marginBottom: 12 }} role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p style={{ color: "#34d399", marginBottom: 12 }} role="status">
          Password updated. Your current session stays signed in.
        </p>
      ) : null}

      <button
        type="submit"
        className="cta-button small-btn"
        disabled={pending}
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
