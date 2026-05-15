"use client";

import { useActionState, useState } from "react";
import { saveQuoteAction, type QuoteFormState } from "./actions";
import type { QuoteLineItem } from "@/db/schema";

const initialState: QuoteFormState = {};

type DraftItem = {
  description: string;
  quantity: number;
  priceDollars: string;
};

function blankItem(): DraftItem {
  return { description: "", quantity: 1, priceDollars: "" };
}

export function QuoteForm({
  leadId,
  initialTitle,
  initialDescription,
  initialItems,
}: {
  leadId: string;
  initialTitle: string;
  initialDescription: string;
  initialItems: QuoteLineItem[];
}) {
  const action = saveQuoteAction.bind(null, leadId);
  const [state, formAction, pending] = useActionState(action, initialState);

  const seed: DraftItem[] =
    initialItems.length > 0
      ? initialItems.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          priceDollars: (it.unitPriceCents / 100).toFixed(2),
        }))
      : [blankItem()];

  const [items, setItems] = useState<DraftItem[]>(seed);

  const subtotal = items.reduce((sum, it) => {
    const price = parseFloat(it.priceDollars || "0");
    if (!Number.isFinite(price)) return sum;
    return sum + price * (it.quantity || 0);
  }, 0);

  const updateItem = (i: number, patch: Partial<DraftItem>) => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    );
  };

  const removeItem = (i: number) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  };

  return (
    <form action={formAction}>
      <div className="input-group input-floating">
        <input
          id="quote-title"
          name="title"
          type="text"
          placeholder=" "
          defaultValue={initialTitle}
          required
          maxLength={200}
        />
        <label htmlFor="quote-title">Quote title</label>
      </div>

      <div className="input-group input-floating">
        <textarea
          id="quote-description"
          name="description"
          placeholder=" "
          rows={3}
          defaultValue={initialDescription}
          maxLength={2000}
        />
        <label htmlFor="quote-description">Description (optional)</label>
      </div>

      <h3 style={{ fontSize: "1.05rem", marginTop: 24, marginBottom: 12 }}>
        Line items
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} className="quote-line">
            <div className="input-group input-floating quote-line-desc">
              <input
                id={`item-description-${i}`}
                name="item-description"
                type="text"
                placeholder=" "
                value={item.description}
                onChange={(e) =>
                  updateItem(i, { description: e.target.value })
                }
                required
                maxLength={200}
              />
              <label htmlFor={`item-description-${i}`}>Description</label>
            </div>
            <div className="input-group input-floating quote-line-qty">
              <input
                id={`item-quantity-${i}`}
                name="item-quantity"
                type="number"
                min={1}
                step={1}
                placeholder=" "
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, {
                    quantity: Math.max(1, parseInt(e.target.value || "1", 10)),
                  })
                }
                required
              />
              <label htmlFor={`item-quantity-${i}`}>Qty</label>
            </div>
            <div className="input-group input-floating quote-line-price">
              <input
                id={`item-price-${i}`}
                name="item-price"
                type="number"
                min={0}
                step="0.01"
                placeholder=" "
                value={item.priceDollars}
                onChange={(e) =>
                  updateItem(i, { priceDollars: e.target.value })
                }
                required
              />
              <label htmlFor={`item-price-${i}`}>Unit $</label>
            </div>
            <button
              type="button"
              className="quote-line-remove"
              onClick={() => removeItem(i)}
              aria-label="Remove line"
              disabled={items.length === 1}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="cta-button small-btn"
        style={{ background: "transparent", marginTop: 12 }}
        onClick={() => setItems((prev) => [...prev, blankItem()])}
      >
        + Add line
      </button>

      <div className="quote-subtotal">
        <span>Subtotal</span>
        <strong>${subtotal.toFixed(2)}</strong>
      </div>

      {state.error ? (
        <p style={{ color: "#ff6b6b", marginTop: 12 }} role="alert">
          {state.error}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button
          type="submit"
          className="cta-button small-btn"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save quote"}
        </button>
      </div>
    </form>
  );
}
