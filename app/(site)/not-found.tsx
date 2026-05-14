import type { Metadata } from "next";
import Link from "next/link";
import { Typewriter } from "@/components/Typewriter";

export const metadata: Metadata = {
  title: "404 Not Found",
  description: "404 Not Found - SensCode.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "SensCode | 404 Not Found",
    description: "404 Not Found - SensCode.",
    type: "website",
  },
};

export default function NotFound() {
  return (
    <header className="hero hero-404">
      <div className="hero-content reveal">
        <span className="tag">Transmission Interrupted — 404</span>
        <Typewriter text="Signal Lost." style={{ marginTop: 10 }} />
        <p>
          We swept the grid. The page you were lookin&apos; for ain&apos;t on
          the map. Could&apos;ve been moved, decommissioned, or never existed in
          the first place.
        </p>

        <div className="intel-log" aria-label="Diagnostic log" role="log">
          <div className="intel-line">
            <span className="intel-tag">LAST PING</span>
            <span className="intel-val">no response</span>
          </div>
          <div className="intel-line">
            <span className="intel-tag">ORIGIN</span>
            <span className="intel-val">
              32.6927° N, 114.6277° W — Yuma, AZ
            </span>
          </div>
          <div className="intel-line">
            <span className="intel-tag">STATUS</span>
            <span className="intel-val">awaiting your next move</span>
          </div>
        </div>

        <p className="waypoints-label">Known waypoints:</p>
        <div className="waypoints">
          <Link href="/" className="waypoint">
            Home
          </Link>
          <Link href="/services" className="waypoint">
            Services
          </Link>
          <Link href="/portfolio" className="waypoint">
            Work
          </Link>
          <Link href="/contact" className="waypoint">
            Contact
          </Link>
        </div>

        <Link href="/" className="cta-button" style={{ marginTop: 28 }}>
          Return to Base
        </Link>
      </div>
    </header>
  );
}
