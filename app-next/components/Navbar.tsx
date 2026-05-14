"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "./SearchTrigger";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/portfolio", label: "Work" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="navbar" aria-label="Main Navigation">
        <div className="logo">
          <Link href="/" className="logo-link">
            SensCode
          </Link>
        </div>
        <ul className="nav-links">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          <SearchTrigger />
          <ThemeToggle />
        </div>
        <button
          id="hamburger"
          type="button"
          className={`hamburger${open ? " active" : ""}`}
          aria-label="Toggle menu"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
      <nav
        id="mobile-menu"
        className={`mobile-menu${open ? " active" : ""}`}
        aria-label="Mobile Navigation"
      >
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <SearchTrigger className="search-trigger--mobile" />
        <ThemeToggle
          style={{ marginTop: 20, fontSize: "1.2rem", padding: "10px 20px" }}
        />
      </nav>
    </>
  );
}
