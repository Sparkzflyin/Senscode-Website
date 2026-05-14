"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      ".reveal, .story-text",
    );

    if (typeof IntersectionObserver !== "function") {
      els.forEach((el) => el.classList.add("active"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          } else if (entry.target.classList.contains("story-text")) {
            entry.target.classList.remove("active");
          }
        });
      },
      // Low threshold so sections taller than the viewport still trigger
      // (e.g. About page Arsenal panel on mobile).
      { threshold: 0.05 },
    );
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
