"use strict";

// Active-card tracking for the about-page toolbelt stack. Detects the
// currently-stuck card on scroll, fires its logo animation, types out its
// code snippet (once), and tints the page background toward the tool's
// brand color. Honors reduce-motion at every step.

(() => {
  const cards = document.querySelectorAll(".sticky-skill-card");
  const container = document.querySelector(".sticky-skills-container");
  if (!cards.length) return;

  const reduced = () =>
    document.body.classList.contains("reduce-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Type each snippet exactly once per page load. Re-activations show the
  // already-typed text instantly so scrolling back doesn't feel chatty.
  const typed = new WeakSet();

  function type(card) {
    if (typed.has(card)) return;
    typed.add(card);
    const el = card.querySelector(".skill-snippet");
    if (!el) return;
    const text = el.dataset.snippet || "";
    if (!text) return;
    if (reduced()) {
      el.textContent = text;
      return;
    }
    el.textContent = "";
    el.classList.add("is-typing");
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) {
        setTimeout(tick, 28 + Math.random() * 22);
      } else {
        setTimeout(() => el.classList.remove("is-typing"), 600);
      }
    };
    tick();
  }

  let lastActive = null;
  function clearActive() {
    if (lastActive) {
      lastActive.classList.remove("is-active");
      lastActive.style.removeProperty("--card-glow");
      lastActive = null;
    }
  }

  function sectionInView() {
    if (!container) return true;
    const r = container.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function update() {
    // Bail out cleanly whenever the user is outside the skills section so
    // the brand tint can never bleed into the footer or surrounding pages.
    if (!sectionInView()) {
      clearActive();
      return;
    }

    // Inside the section: pick the latest-in-DOM-order card whose top sits
    // in the active band (just past the sticky position to ~55% viewport).
    // Since later cards stack on top with higher z-index, "last that fits"
    // = the visually-prominent card.
    let active = null;
    const ceiling = window.innerHeight * 0.55;
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      if (r.top >= 0 && r.top <= ceiling && r.bottom > 0) {
        active = card;
      }
    }

    if (active === lastActive) return;
    if (lastActive) {
      lastActive.classList.remove("is-active");
      lastActive.style.removeProperty("--card-glow");
    }
    if (active) {
      active.classList.add("is-active");
      type(active);
      const tone = active.dataset.tint;
      if (tone) {
        active.style.setProperty("--card-glow", tone);
      }
    }
    lastActive = active;
  }

  let raf = null;
  function schedule() {
    if (raf != null) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      update();
    });
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();
})();
