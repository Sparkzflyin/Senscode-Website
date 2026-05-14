"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR =
  ".glass-panel:not(.no-spotlight), .card:not(.no-spotlight), .process-step:not(.no-spotlight)";

const MAX_TILT = 10;
const SCALE = 1.02;

export function CardTilt() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip on touch-primary / hover-incapable devices. On touch the previous
    // implementation called preventDefault() inside touchmove which made
    // vertical scrolls that started over a card feel locked.
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTOR),
    );
    if (!cards.length) return;

    const cleanups: Array<() => void> = [];

    for (const card of cards) {
      // Add a .spotlight child once. Idempotent — if route re-renders and the
      // same card stays mounted, we don't stack duplicates.
      if (!card.querySelector(":scope > .spotlight")) {
        const spotlight = document.createElement("div");
        spotlight.classList.add("spotlight");
        card.appendChild(spotlight);
      }

      const handleMove = (e: MouseEvent) => {
        if (document.body.classList.contains("reduce-motion")) {
          handleLeave();
          return;
        }
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = ((y - centerY) / centerY) * -MAX_TILT;
        const tiltY = ((x - centerX) / centerX) * MAX_TILT;

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${SCALE}, ${SCALE}, ${SCALE})`;

        const spotlight = card.querySelector<HTMLElement>(":scope > .spotlight");
        if (spotlight) spotlight.style.opacity = "1";
      };

      const handleLeave = () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        const spotlight = card.querySelector<HTMLElement>(":scope > .spotlight");
        if (spotlight) spotlight.style.opacity = "0";
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleLeave);
      cleanups.push(() => {
        card.removeEventListener("mousemove", handleMove);
        card.removeEventListener("mouseleave", handleLeave);
        // Reset transform on unmount so a stuck-tilted card doesn't persist
        // across route changes in dev's hot-reload edge cases.
        card.style.transform = "";
      });
    }

    return () => {
      for (const fn of cleanups) fn();
    };
  }, [pathname]);

  return null;
}
