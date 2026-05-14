"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "./actions";

const initialState: SignInState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} id="contact-form">
      <div className="input-group input-floating">
        <input
          id="signin-email"
          name="email"
          type="email"
          placeholder=" "
          autoComplete="email"
          required
        />
        <label htmlFor="signin-email">Email</label>
      </div>
      <div className="input-group input-floating">
        <input
          id="signin-password"
          name="password"
          type="password"
          placeholder=" "
          autoComplete="current-password"
          required
        />
        <label htmlFor="signin-password">Password</label>
      </div>
      {state.error ? (
        <p style={{ color: "#ff6b6b", marginBottom: 16 }} role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        className="cta-button"
        disabled={pending}
        style={{ width: "100%" }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
