"use client";

import { useRef, useState } from "react";

// Each exploding orb costs a fixed-position layer with mix-blend-mode: screen
// + filter: blur(45px) + 80px box-shadow. Stacking 30 of them murders mobile
// GPUs, so confetti is desktop / fine-pointer only.
const ORB_COUNT = 30;

function spawnOrbs(originBtn: HTMLElement, host: HTMLElement) {
  const rect = originBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const created: HTMLElement[] = [];
  for (let i = 0; i < ORB_COUNT; i++) {
    const orb = document.createElement("div");
    orb.classList.add("exploding-orb");

    const size = Math.random() * 60 + 20;
    const tx = (Math.random() - 0.5) * window.innerWidth * 0.9;
    const ty = (Math.random() - 0.5) * window.innerHeight * 0.9;
    const scale = Math.random() * 1.5 + 0.5;
    const speed = (Math.random() - 0.5) * 0.4;

    const isOrange = Math.random() > 0.5;
    orb.style.setProperty(
      "--orb-color",
      isOrange ? "#ff9500" : "var(--link)",
    );
    orb.style.width = `${size}px`;
    orb.style.height = `${size}px`;
    orb.style.left = `${centerX}px`;
    orb.style.top = `${centerY}px`;
    orb.setAttribute("data-speed", String(speed));
    orb.style.setProperty("--tx", `${tx}px`);
    orb.style.setProperty("--ty", `${ty}px`);
    orb.style.setProperty("--scale", String(scale));

    host.appendChild(orb);
    created.push(orb);
  }
  // Kick the parallax loop (legacy orbs-parallax block listens to scroll +
  // queries .exploding-orb each tick) so the spawned orbs pick up an initial
  // y-offset matching the current scroll position.
  window.dispatchEvent(new Event("scroll"));
  return created;
}

function implodeOrbs() {
  const active = document.querySelectorAll<HTMLElement>(
    ".exploding-orb:not(.implode)",
  );
  active.forEach((orb) => {
    orb.classList.add("implode");
    setTimeout(() => orb.remove(), 800);
  });
}

export function BlowUpToggle() {
  const [blown, setBlown] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const toggle = () => {
    const grid = document.querySelector<HTMLElement>(".bento-grid");
    const btn = btnRef.current;
    if (!grid || !btn) return;

    const willBlow = !grid.classList.contains("blown-up");
    grid.classList.toggle("blown-up", willBlow);
    setBlown(willBlow);

    if (willBlow) {
      const isMobile = window.matchMedia("(pointer: coarse)").matches;
      if (isMobile) return;
      const host = grid.parentNode as HTMLElement | null;
      if (host) spawnOrbs(btn, host);
    } else {
      implodeOrbs();
    }
  };

  return (
    <button
      ref={btnRef}
      id="blowUpBtn"
      className="blow-up-btn"
      type="button"
      onClick={toggle}
      aria-pressed={blown}
    >
      {blown ? "Collapse" : "Blow Up"}
    </button>
  );
}
