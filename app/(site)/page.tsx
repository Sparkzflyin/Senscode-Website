import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, ORGANIZATION_LD } from "@/lib/jsonLd";
import { Typewriter } from "@/components/Typewriter";
import { SplitH2 } from "@/components/SplitH2";

export const metadata: Metadata = {
  title: { absolute: "SensCode | Premium Web Design" },
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd
        graph={[
          ORGANIZATION_LD,
          {
            "@type": "Person",
            "@id": "https://senscode.com/#christian-sparks",
            name: "Christian Sparks",
            givenName: "Christian",
            familyName: "Sparks",
            jobTitle: "Founder & Lead Engineer",
            worksFor: { "@id": "https://senscode.com/#organization" },
            url: "https://senscode.com/about",
            image: "https://senscode.com/assets/Signature.png",
            description:
              "Founder of SensCode, a USMC veteran and full-stack engineer who hand-codes every site on a deliberate, modern stack — no templates, no drag-and-drop builders.",
            knowsAbout: [
              "Web Design",
              "Web Development",
              "Front-End Engineering",
              "UI/UX Design",
              "Performance Optimization",
            ],
            sameAs: [
              "https://github.com/Sparkzflyin",
              "https://www.linkedin.com/in/christian-sparks/",
              "https://www.credly.com/users/christian-sparks.536305e8",
              "https://www.instagram.com/thekid_sparks/",
            ],
          },
          {
            "@type": "WebSite",
            "@id": "https://senscode.com/#website",
            url: "https://senscode.com/",
            name: "SensCode",
            description:
              "Premium, hand-coded web design and development by Christian Sparks.",
            inLanguage: "en-US",
            publisher: { "@id": "https://senscode.com/#organization" },
          },
          {
            "@type": "WebPage",
            "@id": "https://senscode.com/#webpage",
            url: "https://senscode.com/",
            name: "SensCode | Premium Web Design",
            isPartOf: { "@id": "https://senscode.com/#website" },
            about: { "@id": "https://senscode.com/#organization" },
            primaryImageOfPage: "https://senscode.com/og-card.png",
            inLanguage: "en-US",
          },
        ]}
      />

      <dialog className="site-intro" aria-label="Welcome">
        <canvas
          id="intro-particle-canvas"
          className="site-intro-particles"
          aria-hidden="true"
          tabIndex={-1}
        ></canvas>
        <div className="site-intro-content">
          <p className="split-sr">
            You found it. Your next big idea. Come to life.
          </p>
          <p className="site-intro-caption" aria-hidden="true"></p>
          <button type="button" className="cta-button site-intro-btn">
            Come On In
          </button>
        </div>
      </dialog>

      <header className="hero">
        <div
          className="hero-content reveal"
          style={{ position: "relative", zIndex: 2 }}
        >
          <div className="greeting-container">
            {/* TODO(#14): time-based greeting */}
            <p id="time-greeting"></p>
            <output className="status-pill" aria-label="Current availability">
              <span className="status-dot" aria-hidden="true"></span>
              <span>Accepting Booking Until June</span>
            </output>
          </div>
          <Typewriter text="Website Design." typo />
          <p>Experience the next generation of beauty in web-design.</p>
          <Link href="/services" className="cta-button">
            Explore Now
          </Link>
        </div>
      </header>

      <section className="panel reveal">
        <SplitH2 text="Built for Recognition." />
        <div className="grid-3">
          <article className="card glass-panel">
            <div className="card-icon" aria-hidden="true">
              <svg
                viewBox="0 0 30 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 22 Q 9 8, 14 15 T 24 10" />
                <circle
                  cx="24"
                  cy="10"
                  r="1.4"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </div>
            <h3>Personalized</h3>
            <p>
              Uniquely designed for you in a way no one else could. Every choice
              — from grid system to interaction curve — is shaped around your
              brand, not a template. The end result is a site that could only
              belong to you.
            </p>
            <ul className="card-bullets">
              <li>No template libraries or starter kits underneath</li>
              <li>Visual identity built to fit your story, not a trend</li>
              <li>Design decisions made with you, not presented to you</li>
            </ul>
          </article>
          <article className="card glass-panel">
            <div className="card-icon" aria-hidden="true">
              <svg
                viewBox="0 0 30 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 15 Q 8 6, 13 15 T 23 15 Q 25.5 15, 27 12" />
              </svg>
            </div>
            <h3>Style</h3>
            <p>
              Fluid-like motion encompassing your dreams. Transitions, easings,
              and micro-interactions are authored line by line so the feel of
              the site matches the feel of your brand. Polish visitors notice
              but can&apos;t quite explain.
            </p>
            <ul className="card-bullets">
              <li>Motion curves tuned by hand, not pulled from a library</li>
              <li>Typography pairings chosen for voice, not popularity</li>
              <li>Color systems built from intent instead of presets</li>
            </ul>
          </article>
          <article className="card glass-panel">
            <div className="card-icon" aria-hidden="true">
              <svg
                viewBox="0 0 30 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="8" width="14" height="10" rx="1.2" />
                <rect x="19" y="6" width="6" height="14" rx="1.2" />
                <rect x="6" y="22" width="16" height="2.5" rx="1" />
              </svg>
            </div>
            <h3>Versatile</h3>
            <p>
              Run your website across multiple platforms and browsers. Built to
              degrade gracefully on older hardware and respond intelligently to
              every viewport. Visitors get the full experience regardless of how
              they arrive.
            </p>
            <ul className="card-bullets">
              <li>Per-engine performance tuning for Chrome, Firefox, Safari</li>
              <li>Graceful fallbacks when JavaScript or fonts don&apos;t load</li>
              <li>Animations that throttle themselves on low-end devices</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="panel reveal">
        <SplitH2 text="The Process." />
        <div className="process-timeline">
          <div className="process-step">
            <div className="step-number">01</div>
            <h4>Discovery</h4>
            <p>We analyze your vision and technical requirements.</p>
          </div>
          <div className="process-step">
            <div className="step-number">02</div>
            <h4>Architecture</h4>
            <p>Structuring the foundation for scalable performance.</p>
          </div>
          <div className="process-step">
            <div className="step-number">03</div>
            <h4>Refinement</h4>
            <p>Polishing interactions and typographic details.</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="story-text">Design that breathes.</p>
        <p className="story-text">Precision in every pixel.</p>
        <p className="story-text">Your vision, realized.</p>
      </section>

      <section className="marquee-band" aria-label="Brand values">
        <div className="marquee-track">
          <div className="marquee-group">
            <span>Hand-Coded From Scratch</span>
            <span className="dot">◆</span>
            <span>Engineered, Not Templated</span>
            <span className="dot">◆</span>
            <span>Powered By Coffee &amp; Broken Keyboards</span>
            <span className="dot">◆</span>
            <span>One Marine, No Middlemen</span>
            <span className="dot">◆</span>
            <span>Who Knew Ideas Could Look So Dope, I Did</span>
            <span className="dot">◆</span>
            <span>Let&rsquo;s Build Something...Or Not</span>
            <span className="dot">◆</span>
            <span>I Just Work Here...But I&apos;m Pretty Good At My Job, So</span>
            <span className="dot">◆</span>
          </div>
          <div className="marquee-group" aria-hidden="true">
            <span>Hand-Coded From Scratch</span>
            <span className="dot">◆</span>
            <span>Engineered, Not Templated</span>
            <span className="dot">◆</span>
            <span>Powered By Coffee &amp; Broken Keyboards</span>
            <span className="dot">◆</span>
            <span>One Marine, No Middlemen</span>
            <span className="dot">◆</span>
            <span>Who Knew Ideas Could Look So Dope, I Did</span>
            <span className="dot">◆</span>
            <span>Let&rsquo;s Build Something...Or Not</span>
            <span className="dot">◆</span>
            <span>I Just Work Here...But I&apos;m Pretty Good At My Job, So</span>
            <span className="dot">◆</span>
          </div>
        </div>
      </section>
    </>
  );
}
