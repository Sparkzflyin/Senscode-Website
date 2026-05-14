"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR = ".cta-button, .theme-toggle, .small-btn, .blow-up-btn";

export function Magnetic() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    if (!els.length) return;

    const cleanups: Array<() => void> = [];

    for (const el of els) {
      let rect: DOMRect | null = null;

      const onEnter = () => {
        rect = el.getBoundingClientRect();
      };
      const onMove = (e: MouseEvent) => {
        if (document.body.classList.contains("reduce-motion")) {
          el.style.transform = "translate(0px, 0px) scale(1)";
          return;
        }
        if (!rect) return;
        const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
        el.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
      };
      const onLeave = () => {
        el.style.transform = "translate(0px, 0px) scale(1)";
        rect = null;
      };

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        el.style.transform = "";
      });
    }

    return () => {
      for (const fn of cleanups) fn();
    };
  }, [pathname]);

  return null;
}
