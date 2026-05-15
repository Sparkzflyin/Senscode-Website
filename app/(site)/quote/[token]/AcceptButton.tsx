"use client";

import { useActionState } from "react";
import { acceptQuoteAction, type AcceptQuoteState } from "./actions";

const initialState: AcceptQuoteState = {};

export function AcceptButton({ token }: { token: string }) {
  const action = acceptQuoteAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <button
        type="submit"
        className="cta-button"
        disabled={pending}
        style={{ minWidth: 200 }}
      >
        {pending ? "Accepting…" : "Accept quote"}
      </button>
      {state.error ? (
        <p style={{ color: "#ff6b6b", marginTop: 12 }} role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
