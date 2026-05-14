"use client";

import { useActionState } from "react";
import { convertLeadAction, type ConvertLeadState } from "./actions";

const initialState: ConvertLeadState = {};

export function ConvertButton({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(
    convertLeadAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={leadId} />
      <button type="submit" className="cta-button" disabled={pending}>
        {pending ? "Converting…" : "Convert to order"}
      </button>
      {state.error ? (
        <p style={{ color: "#ff6b6b", marginTop: 8 }} role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
