"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

function getThemeSnapshot(): Theme {
  if (typeof document === "undefined") return "dark";
  return (
    (document.documentElement.getAttribute("data-theme") as Theme) || "dark"
  );
}

// SSR snapshot — must be referentially stable, so we just hard-code dark
// (matches the default `data-theme="dark"` set on <html> in app/layout.tsx).
function getThemeServerSnapshot(): Theme {
  return "dark";
}

// MutationObserver lets every <ThemeToggle> instance (and the portfolio demo
// button) stay in sync — whichever one changes data-theme, all the others
// re-render with the new value automatically.
function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onMq = () => {
    if (localStorage.getItem("theme")) return;
    const next: Theme = mq.matches ? "dark" : "light";
    if (document.documentElement.getAttribute("data-theme") !== next) {
      document.documentElement.setAttribute("data-theme", next);
    }
  };
  mq.addEventListener("change", onMq);
  return () => {
    observer.disconnect();
    mq.removeEventListener("change", onMq);
  };
}

export function ThemeToggle({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${className ?? ""}`.trim()}
      style={style}
      aria-label="Toggle color theme"
      onClick={toggle}
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
