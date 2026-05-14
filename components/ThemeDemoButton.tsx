"use client";

import { useState } from "react";

export function ThemeDemoButton() {
  const [label, setLabel] = useState("Toggle Theme");

  return (
    <button
      type="button"
      className="theme-toggle theme-demo-btn"
      aria-label="Toggle theme demo"
      onClick={() => {
        const next =
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "light"
            : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        setLabel(next === "dark" ? "Light Mode" : "Dark Mode");
      }}
    >
      {label}
    </button>
  );
}
