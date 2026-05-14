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

export function ProjectEstimator() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const total = useMemo(() => {
    return OPTIONS.reduce(
      (sum, opt) => (checked[opt.id] ? sum + opt.value : sum),
      BASELINE,
    );
  }, [checked]);

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
    </div>
  );
}
