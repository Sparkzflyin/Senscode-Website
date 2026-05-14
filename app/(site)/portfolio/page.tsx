import type { Metadata } from "next";
import Script from "next/script";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";
import { BlowUpToggle } from "@/components/BlowUpToggle";
import { ThemeDemoButton } from "@/components/ThemeDemoButton";
import { Typewriter } from "@/components/Typewriter";
import "./portfolio.css";

export const metadata: Metadata = {
  title: "Portfolio & Lab",
  description:
    "Explore the portfolio, case studies, and digital experiments by SensCode.",
  keywords: [
    "portfolio",
    "web design case study",
    "UI/UX experiments",
    "SensCode work",
  ],
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "SensCode | Portfolio & Lab",
    description:
      "Explore the portfolio, case studies, and digital experiments by SensCode.",
    url: "/portfolio",
    type: "website",
    images: [
      {
        url: "/og-card.png",
        width: 2400,
        height: 1260,
        alt: "SensCode portfolio and lab — case studies and digital experiments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SensCode | Portfolio & Lab",
    description:
      "Explore the portfolio, case studies, and digital experiments by SensCode.",
    images: ["/og-card.png"],
  },
};

export default function PortfolioPage() {
  return (
    <>
      <JsonLd
        graph={[
          {
            ...ORGANIZATION_LD,
            description:
              "Premium, hand-coded web design and development. USMC veteran-owned studio in Yuma, Arizona.",
            founder: {
              "@type": "Person",
              "@id": "https://senscode.com/#christian-sparks",
              name: "Christian Sparks",
              jobTitle: "Founder & Lead Engineer",
              url: "https://senscode.com/about",
            },
            address: {
              "@type": "PostalAddress",
              addressLocality: "Yuma",
              addressRegion: "AZ",
              postalCode: "85364",
              addressCountry: "US",
            },
            sameAs: [
              "https://github.com/Sparkzflyin",
              "https://www.linkedin.com/in/christian-sparks/",
              "https://www.credly.com/users/christian-sparks.536305e8",
              "https://www.instagram.com/thekid_sparks/",
            ],
          },
          breadcrumbLd([
            { name: "Home", url: "https://senscode.com/" },
            { name: "Portfolio", url: "https://senscode.com/portfolio" },
          ]),
          {
            "@type": "CollectionPage",
            "@id": "https://senscode.com/portfolio#webpage",
            url: "https://senscode.com/portfolio",
            name: "SensCode | Portfolio & Lab",
            description:
              "Portfolio, case studies, and digital experiments by SensCode.",
            isPartOf: { "@id": "https://senscode.com/#website" },
            about: { "@id": "https://senscode.com/#organization" },
            inLanguage: "en-US",
          },
        ]}
      />

      <header className="hero">
        <div className="hero-content reveal">
          <Typewriter text="The Architecture." />
          <p>A deconstruction of the elements that forge SensCode.</p>
        </div>
      </header>

      <section className="panel" style={{ paddingTop: 20, position: "relative" }}>
        <div
          className="blow-up-container reveal"
          style={{ position: "relative", zIndex: 1 }}
        >
          <BlowUpToggle />
        </div>
        <div className="bento-grid" style={{ position: "relative", zIndex: 1 }}>
          {/* 1 — Glassmorphism (large) */}
          <article className="card glass-panel reveal bento-large bento-item">
            <div className="bento-icon">🪟</div>
            <h3>Glassmorphism UI</h3>
            <p>
              The defining aesthetic of the platform. Instead of flat, solid
              colors, we utilize a combination of CSS{" "}
              <code>backdrop-filter: blur()</code>, semi-transparent
              backgrounds, and subtle 1px luminous borders. This creates a
              frosted-glass effect that allows the underlying gradients and
              parallax elements to softly bleed through, providing a profound
              sense of depth and hierarchy without overwhelming the content.
            </p>
            <div className="bento-visual" style={{ marginTop: 30 }}>
              <div
                style={{
                  width: "100%",
                  height: 100,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 60,
                    height: 60,
                    background: "var(--accent)",
                    borderRadius: "50%",
                    top: -10,
                    left: -10,
                    filter: "blur(20px)",
                    opacity: 0.5,
                  }}
                ></div>
                <span style={{ fontWeight: 500, zIndex: 2 }}>
                  Translucent Depth
                </span>
              </div>
            </div>
          </article>

          {/* 2 — Kinetic 3D Tilt */}
          <article className="card glass-panel reveal bento-item">
            <div className="bento-icon">🕹️</div>
            <h3>Kinetic 3D Tilt</h3>
            <p>
              Every major card on the site acts as a physical object. Using
              custom Javascript mathematics, we track mouse and touch
              coordinates across the element&apos;s bounding box, mapping them
              to CSS <code>rotateX</code> and <code>rotateY</code> transforms.
              It&rsquo;s a tactile response that makes the interface feel alive.
            </p>
          </article>

          {/* 3 — Humanized Typing */}
          <article className="card glass-panel reveal bento-item">
            <div className="bento-icon">⌨️</div>
            <h3>Humanized Typing</h3>
            <Typewriter
              as="p"
              id="bento-typewriter-p"
              style={{ minHeight: 80 }}
              text="Rather than standard static text, the hero headers employ a custom typewriter effect. On the index page, it intentionally introduces realistic transposition typos before backspacing and correcting itself, adding a touch of humanity to the digital experience."
              typo
              typoTarget={3}
              typoOverride="statci"
              initialDelay={1000}
              typeSpeed={{ min: 40, range: 50 }}
              deleteSpeed={{ min: 40, range: 0 }}
            />
          </article>

          {/* 4 — Luminous Parallax Engine (wide) */}
          <article className="card glass-panel reveal bento-wide bento-item">
            <div className="bento-icon">✨</div>
            <h3>Luminous Parallax Engine</h3>
            <p>
              The floating orbs that drift behind the content aren&apos;t static
              images or heavy WebGL canvases. They are pure CSS shapes driven by
              a lightweight JavaScript loop hooking into the scroll event. Each
              orb is assigned a unique <code>data-speed</code> multiplier,
              meaning elements closer to the &quot;lens&quot; move faster than
              those in the distance, simulating true 3D space entirely through
              2D DOM manipulation.
            </p>
            <div className="bento-visual">
              {/* TODO(#14): click-to-bounce + explode */}
              <div className="interactive-orb" id="lab-orb" title="Click me"></div>
            </div>
          </article>

          {/* 5 — System-Aware Theming */}
          <article className="card glass-panel reveal bento-item">
            <div className="bento-icon">🌗</div>
            <h3>System-Aware Theming</h3>
            <p>
              A robust theme engine that listens to{" "}
              <code>window.matchMedia</code>. It seamlessly tracks your
              operating system&apos;s color scheme in real-time, instantly
              adjusting CSS variables. If manually overridden via the toggle, it
              gracefully stores the preference in local storage.
            </p>
            <div className="bento-visual">
              <ThemeDemoButton />
            </div>
          </article>

          {/* 6 — Dynamic Spotlights */}
          <article className="card glass-panel reveal bento-item">
            <div className="bento-icon">🔦</div>
            <h3>Dynamic Spotlights</h3>
            <p>
              A subtle luxury touch. As your cursor moves across interactive
              panels, a radial gradient mapping tracks the coordinates,
              illuminating the borders and content like a flashlight shining
              across frosted glass.
            </p>
            <div className="bento-visual">
              <div className="spotlight-demo">
                <span
                  style={{ position: "relative", zIndex: 2, fontWeight: 500 }}
                >
                  Hover Me
                </span>
                <div
                  className="demo-spotlight"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%)",
                    zIndex: 1,
                  }}
                ></div>
              </div>
            </div>
          </article>

          {/* 7 — Interactive Constellation (wide, no-spotlight) */}
          <article className="card glass-panel reveal bento-wide bento-item no-spotlight">
            <div className="bento-icon">🌌</div>
            <h3>Interactive Constellation</h3>
            <p>
              A dense, localized demonstration of the interactive particle
              network. This highly concentrated node field utilizes an HTML5
              Canvas to simulate a self-contained ecosystem. It features
              calculated physics including kinetic drift, friction limits, and
              explosive repulsion driven directly by the user&apos;s cursor
              movements and clicks.
            </p>
            <div
              className="bento-visual"
              style={{
                position: "relative",
                width: "100%",
                borderRadius: 15,
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* TODO(#14): local-particle-canvas physics */}
              <canvas
                id="local-particle-canvas"
                style={{ width: "100%", height: "100%", display: "block" }}
                aria-hidden="true"
                tabIndex={-1}
              ></canvas>
            </div>
          </article>

          {/* 8 — Engineered, Not Assembled (wide, centered) */}
          <article
            className="card glass-panel reveal bento-wide bento-item"
            style={{
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div className="bento-icon">⚡</div>
            <h3 style={{ fontSize: "1.8rem" }}>Engineered, Not Assembled</h3>
            <p style={{ maxWidth: 600, margin: "0 auto" }}>
              No drag-and-drop builders, no inherited template debt. Every
              dependency in the stack — Next.js, Tailwind, Sanity, Postgres —
              earns its place by being measured before it ships. Code is
              hand-written, render paths are profiled, and you walk away with
              the entire source on day one.
            </p>
          </article>
        </div>
      </section>
      <Script src="/card-shader.js" strategy="afterInteractive" />
      <Script src="/portfolio-effects.js" strategy="afterInteractive" />
    </>
  );
}
