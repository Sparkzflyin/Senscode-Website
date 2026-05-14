"use client";

import { useActionState, useState } from "react";
import { updateSettingsAction, type SettingsState } from "./actions";
import type { SiteStatusColor } from "@/db/schema";

const initialState: SettingsState = {};

const COLOR_OPTIONS: Array<{
  value: SiteStatusColor;
  label: string;
  hex: string;
  hint: string;
}> = [
  { value: "green", label: "Green", hex: "#22c55e", hint: "Open / available" },
  { value: "yellow", label: "Yellow", hex: "#eab308", hint: "Limited / waitlist" },
  { value: "red", label: "Red", hex: "#ef4444", hint: "Closed / not booking" },
];

export function SettingsForm({
  initialColor,
  initialText,
}: {
  initialColor: SiteStatusColor;
  initialText: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateSettingsAction,
    initialState,
  );
  const [color, setColor] = useState<SiteStatusColor>(initialColor);
  const [text, setText] = useState(initialText);

  const previewHex =
    COLOR_OPTIONS.find((c) => c.value === color)?.hex ?? "#22c55e";

  return (
    <form action={formAction}>
      <div style={{ marginBottom: 24 }}>
        <span
          style={{
            display: "block",
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: 8,
          }}
        >
          Preview
        </span>
        <output
          className="status-pill"
          aria-label="Status preview"
          style={{ marginTop: 0 }}
        >
          <span
            className="status-dot"
            data-color={color}
            aria-hidden="true"
            style={{
              background: previewHex,
              boxShadow: `0 0 10px ${previewHex}`,
            }}
          />
          <span>{text || "Status text here"}</span>
        </output>
      </div>

      <fieldset
        style={{ border: 0, padding: 0, margin: "0 0 20px" }}
      >
        <legend
          style={{
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: 10,
            padding: 0,
          }}
        >
          Status color
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {COLOR_OPTIONS.map((opt) => {
            const checked = color === opt.value;
            return (
              <label
                key={opt.value}
                className="settings-color-option"
                data-checked={checked ? "true" : "false"}
              >
                <input
                  type="radio"
                  name="statusColor"
                  value={opt.value}
                  checked={checked}
                  onChange={() => setColor(opt.value)}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: opt.hex,
                    boxShadow: `0 0 8px ${opt.hex}`,
                  }}
                />
                <span style={{ fontWeight: 600 }}>{opt.label}</span>
                <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                  {opt.hint}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="input-group input-floating">
        <input
          id="status-text"
          name="statusText"
          type="text"
          placeholder=" "
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={80}
        />
        <label htmlFor="status-text">Status text (max 80 chars)</label>
      </div>

      {state.error ? (
        <p style={{ color: "#ff6b6b", marginBottom: 12 }} role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p style={{ color: "#34d399", marginBottom: 12 }} role="status">
          Status saved. Home page will reflect it on next visit.
        </p>
      ) : null}

      <button type="submit" className="cta-button small-btn" disabled={pending}>
        {pending ? "Saving…" : "Save status"}
      </button>
    </form>
  );
}
