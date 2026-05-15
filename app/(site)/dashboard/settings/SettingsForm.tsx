"use client";

import { useActionState, useState } from "react";
import { updateSettingsAction, type SettingsState } from "./actions";
import type { SiteStatusColor, SiteStatusMode } from "@/db/schema";

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

const COLOR_HEX: Record<SiteStatusColor, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

export function SettingsForm({
  initialMode,
  initialColor,
  initialText,
  autoPreviewColor,
  autoPreviewText,
  autoActiveCount,
}: {
  initialMode: SiteStatusMode;
  initialColor: SiteStatusColor;
  initialText: string;
  autoPreviewColor: SiteStatusColor | null;
  autoPreviewText: string | null;
  autoActiveCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    updateSettingsAction,
    initialState,
  );
  const [mode, setMode] = useState<SiteStatusMode>(initialMode);
  const [color, setColor] = useState<SiteStatusColor>(initialColor);
  const [text, setText] = useState(initialText);

  const isAuto = mode === "auto";
  const previewColor = isAuto ? (autoPreviewColor ?? color) : color;
  const previewText = isAuto ? (autoPreviewText ?? text) : text;
  const previewHex = COLOR_HEX[previewColor];

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
          Preview {isAuto ? "(live, from active orders)" : ""}
        </span>
        <output
          className="status-pill"
          aria-label="Status preview"
          style={{ marginTop: 0 }}
        >
          <span
            className="status-dot"
            data-color={previewColor}
            aria-hidden="true"
            style={{
              background: previewHex,
              boxShadow: `0 0 10px ${previewHex}`,
            }}
          />
          <span>{previewText || "Status text here"}</span>
        </output>
        {isAuto ? (
          <p style={{ opacity: 0.7, fontSize: "0.85rem", marginTop: 8 }}>
            Currently {autoActiveCount} active order
            {autoActiveCount === 1 ? "" : "s"} in flight. 0-2 → green, 3-4 →
            yellow, 5+ → red.
          </p>
        ) : null}
      </div>

      <fieldset style={{ border: 0, padding: 0, margin: "0 0 24px" }}>
        <legend
          style={{
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: 10,
            padding: 0,
          }}
        >
          Mode
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {(
            [
              {
                value: "manual" as const,
                label: "Manual",
                hint: "I'll pick color + text",
              },
              {
                value: "auto" as const,
                label: "Auto",
                hint: "Derived from active orders",
              },
            ]
          ).map((opt) => {
            const checked = mode === opt.value;
            return (
              <label
                key={opt.value}
                className="settings-color-option"
                data-checked={checked ? "true" : "false"}
              >
                <input
                  type="radio"
                  name="statusMode"
                  value={opt.value}
                  checked={checked}
                  onChange={() => setMode(opt.value)}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
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

      <fieldset
        style={{
          border: 0,
          padding: 0,
          margin: "0 0 20px",
          opacity: isAuto ? 0.45 : 1,
          pointerEvents: isAuto ? "none" : "auto",
        }}
        disabled={isAuto}
      >
        <legend
          style={{
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: 10,
            padding: 0,
          }}
        >
          Status color {isAuto ? "(ignored in auto mode)" : ""}
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

      <div
        className="input-group input-floating"
        style={{
          opacity: isAuto ? 0.45 : 1,
          pointerEvents: isAuto ? "none" : "auto",
        }}
      >
        <input
          id="status-text"
          name="statusText"
          type="text"
          placeholder=" "
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={80}
          disabled={isAuto}
        />
        <label htmlFor="status-text">
          Status text {isAuto ? "(ignored in auto mode)" : "(max 80 chars)"}
        </label>
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
