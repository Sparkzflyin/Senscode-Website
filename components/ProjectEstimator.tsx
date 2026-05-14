"use client";

import { useMemo, useState } from "react";

const BASELINE = 300;

type Option = {
  id: string;
  value: number;
  label: string;
  description: string;
};

const OPTIONS: Option[] = [
  {
    id: "est-consulting",
    value: 500,
    label: "Technical Consulting",
    description: "Architecture planning and code audits.",
  },
  {
    id: "est-fullscope",
    value: 1000,
    label: "Full Scope Design & UI/UX",
    description: "Complete custom design and responsive front-end build.",
  },
  {
    id: "est-ecommerce",
    value: 1200,
    label: "E-commerce Architecture",
    description: "Secure payment gateways and inventory management.",
  },
  {
    id: "est-animations",
    value: 800,
    label: "Kinetic & 3D Animations",
    description:
      "WebGL, custom physics, and interactive particle canvases.",
  },
  {
    id: "est-cms",
    value: 800,
    label: "Custom CMS Integration",
    description: "Manage your own content without touching code.",
  },
  {
    id: "est-seo",
    value: 400,
    label: "Advanced SEO & Analytics",
    description: "Deep structural optimization and tracking integration.",
  },
];

type SendState = "idle" | "sending" | "sent" | "error";

export function ProjectEstimator() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sendState, setSendState] = useState<SendState>("idle");

  const selected = useMemo(
    () => OPTIONS.filter((opt) => checked[opt.id]),
    [checked],
  );

  const total = useMemo(
    () => selected.reduce((sum, opt) => sum + opt.value, BASELINE),
    [selected],
  );

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendState === "sending") return;
    setSendState("sending");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "estimator",
          name: name.trim() || null,
          email: email.trim(),
          payload: {
            name: name.trim() || null,
            email: email.trim(),
            message: message.trim() || null,
            total,
            baseline: BASELINE,
            "selected-options": selected.map((opt) => ({
              id: opt.id,
              label: opt.label,
              value: opt.value,
            })),
          },
        }),
      });
      if (!res.ok) throw new Error(`Lead save failed (${res.status})`);
      setSendState("sent");
      setName("");
      setEmail("");
      setMessage("");
      setChecked({});
    } catch (err) {
      console.warn("[senscode] estimator submit failed:", err);
      setSendState("error");
    }
  };

  return (
    <div
      className="card glass-panel no-spotlight"
      id="estimator-panel"
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <h2>Project Estimator</h2>
      <p className="card-desc" style={{ textAlign: "center", marginBottom: 30 }}>
        Configure your ideal build and instantly see the estimated investment
        required.
      </p>

      <div className="estimator-grid">
        {OPTIONS.map((opt) => (
          <div key={opt.id} className="estimator-option">
            <label className="toggle-switch" aria-label={opt.label}>
              <input
                type="checkbox"
                id={opt.id}
                value={opt.value}
                checked={!!checked[opt.id]}
                onChange={(e) =>
                  setChecked((prev) => ({
                    ...prev,
                    [opt.id]: e.target.checked,
                  }))
                }
              />
              <span className="slider"></span>
            </label>
            <div className="option-text">
              <strong>{opt.label}</strong>
              <span>{opt.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="estimator-total">
        <div className="total-label">Estimated Baseline</div>
        <div className="total-value" id="est-total-price">
          ${total.toLocaleString()}
        </div>
      </div>

      <form onSubmit={handleSend} className="estimator-send">
        <p className="estimator-send-lede">
          Like what you see? Send this quote and Christian will reach out.
        </p>
        <div className="estimator-send-grid">
          <div className="input-group input-floating">
            <input
              id="est-name"
              type="text"
              placeholder=" "
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="est-name">Name (optional)</label>
          </div>
          <div className="input-group input-floating">
            <input
              id="est-email"
              type="email"
              placeholder=" "
              autoComplete="email"
              required
              maxLength={250}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="est-email">Email</label>
          </div>
        </div>
        <div className="input-group input-floating">
          <textarea
            id="est-message"
            placeholder=" "
            rows={3}
            maxLength={1500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <label htmlFor="est-message">Anything to add? (optional)</label>
        </div>
        <button
          type="submit"
          className="cta-button"
          disabled={sendState === "sending" || sendState === "sent"}
        >
          {sendState === "sending"
            ? "Sending…"
            : sendState === "sent"
              ? "✓ Quote sent"
              : "Send this quote"}
        </button>
        {sendState === "error" ? (
          <p
            role="alert"
            style={{ color: "#ff6b6b", marginTop: 12, fontSize: "0.95rem" }}
          >
            Couldn&apos;t send the quote — try again, or hit the{" "}
            <a href="/contact" style={{ color: "var(--link)" }}>
              contact form
            </a>
            .
          </p>
        ) : null}
        {sendState === "sent" ? (
          <p style={{ marginTop: 12, fontSize: "0.95rem", opacity: 0.8 }}>
            Quote delivered. Christian will be in touch within 24 hours.
          </p>
        ) : null}
      </form>
    </div>
  );
}
