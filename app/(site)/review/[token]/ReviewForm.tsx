"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, type SubmitReviewState } from "./actions";

const initialState: SubmitReviewState = {};

export function ReviewForm({ token }: { token: string }) {
  const action = submitReviewAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [rating, setRating] = useState(5);

  return (
    <form action={formAction}>
      <input type="hidden" name="rating" value={rating} />
      <fieldset style={{ border: 0, padding: 0, margin: "0 0 20px" }}>
        <legend
          style={{
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: 10,
            padding: 0,
          }}
        >
          Rating
        </legend>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className="review-star"
              data-on={star <= rating ? "true" : "false"}
              onClick={() => setRating(star)}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <div className="input-group input-floating">
        <textarea
          id="review-quote"
          name="quote"
          placeholder=" "
          rows={5}
          required
          maxLength={1000}
        />
        <label htmlFor="review-quote">
          What was working with SensCode like?
        </label>
      </div>

      <div className="input-group input-floating">
        <input
          id="review-name"
          name="clientName"
          type="text"
          placeholder=" "
          required
          maxLength={120}
        />
        <label htmlFor="review-name">Your name</label>
      </div>

      <div className="input-group input-floating">
        <input
          id="review-role"
          name="clientRole"
          type="text"
          placeholder=" "
          maxLength={120}
        />
        <label htmlFor="review-role">
          Role or company (optional, e.g. &quot;Founder, Acme&quot;)
        </label>
      </div>

      {state.error ? (
        <p style={{ color: "#ff6b6b", marginTop: 12 }} role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="cta-button"
        disabled={pending}
        style={{ minWidth: 200, marginTop: 12 }}
      >
        {pending ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
