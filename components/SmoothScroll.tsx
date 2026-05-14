"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let activeLenis: Lenis | null = null;

export function scrollToTop() {
  if (activeLenis) {
    activeLenis.scrollTo(0);
    return;
  }
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1,
    });
    activeLenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      if (!document.hidden) lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      activeLenis = null;
    };
  }, []);

  return null;
}
