"use client";

import { useEffect, useState } from "react";
import { scrollToTop } from "./SmoothScroll";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      id="back-to-top"
      type="button"
      className={`back-to-top${visible ? " visible" : ""}`}
      aria-label="Back to top"
      onClick={scrollToTop}
    >
      ↑
    </button>
  );
}
