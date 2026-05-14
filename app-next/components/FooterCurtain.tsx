"use client";

import { useEffect } from "react";

export function FooterCurtain() {
  useEffect(() => {
    const wrapper = document.querySelector<HTMLElement>(".curtain-wrapper");
    const footer = document.querySelector<HTMLElement>(".footer-panel");
    if (!wrapper || !footer) return;

    const updateMargin = () => {
      wrapper.style.marginBottom = `${footer.offsetHeight}px`;
    };

    const updateFooterTransform = () => {
      const docHeight = document.documentElement.scrollHeight;
      const scrollPos = window.scrollY + window.innerHeight;
      const footerHeight = footer.offsetHeight;

      const revealAmount = Math.max(0, scrollPos - (docHeight - footerHeight));

      if (revealAmount > 0 && revealAmount < footerHeight) {
        const yPos = (footerHeight - revealAmount) * 0.4;
        footer.style.transform = `translateY(${yPos}px)`;
      } else if (revealAmount >= footerHeight) {
        footer.style.transform = "translateY(0)";
      } else {
        footer.style.transform = `translateY(${footerHeight * 0.4}px)`;
      }
    };

    updateMargin();
    updateFooterTransform();

    const resizeObs = new ResizeObserver(() => {
      updateMargin();
      updateFooterTransform();
    });
    resizeObs.observe(footer);
    resizeObs.observe(wrapper);

    window.addEventListener("scroll", updateFooterTransform, { passive: true });

    return () => {
      resizeObs.disconnect();
      window.removeEventListener("scroll", updateFooterTransform);
      footer.style.transform = "";
      wrapper.style.marginBottom = "";
    };
  }, []);

  return null;
}
