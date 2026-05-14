import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";
import { Typewriter } from "@/components/Typewriter";
import { SplitH2 } from "@/components/SplitH2";

export const metadata: Metadata = {
  title: "About Christian Sparks & SensCode",
  description:
    "Learn about Christian Sparks, Founder & Lead Engineer at SensCode. Discover our core principles of aesthetic precision and performance.",
  keywords: [
    "about SensCode",
    "Christian Sparks",
    "web design principles",
    "front-end engineer",
    "Yuma web developer",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "SensCode | About Christian Sparks & SensCode",
    description:
      "Learn about Christian Sparks, Founder & Lead Engineer at SensCode. Discover our core principles of aesthetic precision.",
    url: "/about",
    type: "profile",
    images: [
      {
        url: "/og-card.png",
        width: 2400,
        height: 1260,
        alt: "Christian Sparks, Founder & Lead Engineer at SensCode",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SensCode | About Christian Sparks & SensCode",
    description:
      "Learn about Christian Sparks, Founder & Lead Engineer at SensCode, and the principles of aesthetic precision behind every project.",
    images: ["/og-card.png"],
  },
  other: {
    "profile:first_name": "Christian",
    "profile:last_name": "Sparks",
  },
};

type Skill = {
  className: string;
  tint: string;
  name: string;
  caption: string;
  snippet: string;
  svg: React.ReactNode;
};

const SKILLS: Skill[] = [
  {
    className: "skill-react",
    tint: "#61dafb",
    name: "React",
    caption: "Component-Driven UI",
    snippet: "<Card>{children}</Card>",
    svg: (
      <svg className="skill-logo" viewBox="-50 -50 100 100" aria-hidden="true">
        <circle cx="0" cy="0" r="6" fill="currentColor" />
        <ellipse className="ring" cx="0" cy="0" rx="40" ry="15" />
        <ellipse className="ring" cx="0" cy="0" rx="40" ry="15" />
        <ellipse className="ring" cx="0" cy="0" rx="40" ry="15" />
        <circle className="electron" cx="0" cy="0" r="3.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    className: "skill-typescript",
    tint: "#3178c6",
    name: "TypeScript",
    caption: "Type-Safe Architecture",
    snippet: "type User = { id: string; }",
    svg: (
      <svg className="skill-logo" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="6" y="6" width="52" height="52" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
        <text x="32" y="42" textAnchor="middle" fontSize="22" fontWeight="700" fill="currentColor" fontFamily="ui-monospace, 'SF Mono', monospace">
          TS
        </text>
      </svg>
    ),
  },
  {
    className: "skill-node",
    tint: "#5fa04e",
    name: "Node.js",
    caption: "Scalable Backend",
    snippet: "app.listen(3000)",
    svg: (
      <svg className="skill-logo" viewBox="0 0 64 64" aria-hidden="true">
        <polygon points="32,6 56,20 56,44 32,58 8,44 8,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <text x="32" y="40" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor" fontFamily="ui-monospace, 'SF Mono', monospace">
          N
        </text>
      </svg>
    ),
  },
  {
    className: "skill-next",
    tint: "#a3a3a3",
    name: "Next.js",
    caption: "Modern React Framework",
    snippet: "export default Page;",
    svg: (
      <svg className="skill-logo" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M22 18 L22 46 M22 18 L43 46" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="43" y1="22" x2="43" y2="46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    className: "skill-animations",
    tint: "#c084fc",
    name: "Animations",
    caption: "Fluid User Experiences",
    snippet: "@keyframes glow { ... }",
    svg: (
      <svg className="skill-logo" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M6 32 Q22 8, 32 32 T58 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="6" cy="32" r="3" fill="currentColor" />
        <circle cx="58" cy="32" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    className: "skill-html",
    tint: "#e34f26",
    name: "HTML5/CSS3",
    caption: "Semantic & Responsive",
    snippet: "display: grid;",
    svg: (
      <svg className="skill-logo" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M10 8 L54 8 L50 50 L32 58 L14 50 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <text x="32" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor" fontFamily="ui-monospace, 'SF Mono', monospace">
          5/3
        </text>
      </svg>
    ),
  },
  {
    className: "skill-git",
    tint: "#f05032",
    name: "Git / GitHub",
    caption: "Version Control",
    snippet: "git push origin main",
    svg: (
      <svg className="skill-logo" viewBox="0 0 64 64" aria-hidden="true">
        <line x1="20" y1="14" x2="20" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 28 Q20 36 36 36 L46 36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="20" cy="14" r="4" fill="currentColor" />
        <circle cx="20" cy="50" r="4" fill="currentColor" />
        <circle cx="48" cy="36" r="4" fill="currentColor" />
      </svg>
    ),
  },
  {
    className: "skill-python",
    tint: "#ffd43b",
    name: "Python",
    caption: "Data & Automation",
    snippet: "def main(): ...",
    svg: (
      <svg className="skill-logo" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M14 26 Q14 14, 32 14 L32 30 L46 30 Q50 30, 50 36 L50 50 Q50 58, 32 58 L32 42 L18 42 Q14 42, 14 36 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="22" cy="20" r="2" fill="currentColor" />
        <circle cx="42" cy="44" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    className: "skill-seo",
    tint: "#34d399",
    name: "SEO",
    caption: "Search Optimization",
    snippet: '<meta name="description">',
    svg: (
      <svg className="skill-logo" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="26" cy="26" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
        <line x1="36" y1="36" x2="52" y2="52" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    className: "skill-vercel",
    tint: "#b794f4",
    name: "Vercel",
    caption: "Edge Deployment",
    snippet: "vercel deploy --prod",
    svg: (
      <svg className="skill-logo" viewBox="0 0 64 56" aria-hidden="true">
        <polygon points="32,6 60,50 4,50" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const ORBS = [
  { className: "orb orb-1", speed: 0.15 },
  { className: "orb orb-5", speed: 0.08 },
  { className: "orb orb-2", speed: -0.2 },
  { className: "orb orb-6", speed: -0.12 },
  { className: "orb orb-3", speed: 0.1 },
  { className: "orb orb-4", speed: -0.15 },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        graph={[
          {
            ...ORGANIZATION_LD,
            description:
              "Premium, hand-coded web design and development. USMC veteran-owned studio in Yuma, Arizona.",
            founder: { "@id": "https://senscode.com/#christian-sparks" },
            address: {
              "@type": "PostalAddress",
              addressLocality: "Yuma",
              addressRegion: "AZ",
              postalCode: "85364",
              addressCountry: "US",
            },
            areaServed: [
              { "@type": "Country", name: "United States" },
              { "@type": "AdministrativeArea", name: "Worldwide (remote)" },
            ],
            geo: {
              "@type": "GeoCoordinates",
              latitude: 32.6927,
              longitude: -114.6277,
            },
            sameAs: [
              "https://github.com/Sparkzflyin",
              "https://www.linkedin.com/in/christian-sparks/",
              "https://www.credly.com/users/christian-sparks.536305e8",
              "https://www.instagram.com/thekid_sparks/",
            ],
          },
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
              "Founder and Lead Engineer at SensCode. USMC veteran and front-end engineer who hand-codes every site without frameworks or templates.",
            knowsAbout: [
              "Web Design",
              "Web Development",
              "Front-End Engineering",
              "UI/UX Design",
              "Performance Optimization",
              "Accessibility",
              "Search Engine Optimization",
              "React",
              "TypeScript",
              "Node.js",
              "Next.js",
              "HTML5",
              "CSS3",
              "Python",
              "Git",
              "Vercel",
            ],
            alumniOf: {
              "@type": "Organization",
              name: "United States Marine Corps",
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
            { name: "About", url: "https://senscode.com/about" },
          ]),
          {
            "@type": "AboutPage",
            "@id": "https://senscode.com/about#webpage",
            url: "https://senscode.com/about",
            name: "SensCode | About Christian Sparks & SensCode",
            description:
              "Christian Sparks, Founder & Lead Engineer at SensCode, and the core principles of aesthetic precision, uncompromising performance, and radical transparency that guide every project.",
            mainEntity: { "@id": "https://senscode.com/#christian-sparks" },
            isPartOf: { "@id": "https://senscode.com/#website" },
            inLanguage: "en-US",
          },
        ]}
      />

      <section className="panel">
        <div className="founder-note">
          <span className="tag reveal">Direct from the Founder</span>
          <Typewriter
            text="Quality without Compromise."
            className="reveal"
            style={{ marginTop: 10, fontSize: "clamp(1.8rem, 5.2vw, 4rem)" }}
          />

          <p className="story-text">
            At the heart of every product I build is a simple belief:
            professional grade quality shouldn&apos;t be out of reach for the
            everyday user.
          </p>

          <p className="story-text" style={{ transitionDelay: "0.4s" }}>
            As a U.S. Marine Corps veteran, I bring the values of precision,
            integrity, and unwavering commitment to every project. This
            isn&apos;t a large, faceless agency; it&apos;s a dedicated one-man
            operation focused entirely on the craftsmanship of your experience.
          </p>

          <p className="story-text" style={{ transitionDelay: "0.8s" }}>
            By handling every line of code myself, I&rsquo;m able to offer
            premium, reliable services with personal accountability.
          </p>
          <p className="story-text" style={{ transitionDelay: "1.2s" }}>
            - Christian T. Sparks
          </p>

          <div
            className="signature-container reveal"
            style={{ transitionDelay: "1.2s" }}
          >
            <Image
              src="/assets/Signature.png"
              alt="Christian Sparks Signature"
              className="signature-img"
              width={450}
              height={300}
              loading="lazy"
            />
            <span className="founder-title">Founder &amp; Lead Engineer</span>
          </div>
        </div>
      </section>

      <section className="panel reveal">
        <SplitH2 text="Core Principles." />
        <div className="grid-3">
          <article className="card glass-panel">
            <div className="card-icon" aria-hidden="true">
              <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="15" cy="15" r="10" />
                <circle cx="15" cy="15" r="3.5" />
                <line x1="15" y1="2.5" x2="15" y2="7" />
                <line x1="15" y1="23" x2="15" y2="27.5" />
                <line x1="2.5" y1="15" x2="7" y2="15" />
                <line x1="23" y1="15" x2="27.5" y2="15" />
              </svg>
            </div>
            <h3>Aesthetic Precision</h3>
            <p>
              Every pixel is purposefully placed to create an experience that
              feels intuitively beautiful. Whitespace, rhythm, and hierarchy are
              treated as load-bearing — not garnish. The result is a site that
              looks effortless because the effort was hidden.
            </p>
            <ul className="card-bullets">
              <li>Layouts built on a baseline grid, not eyeballed spacing</li>
              <li>Type scale derived mathematically, not guessed</li>
              <li>No decorative flourishes added without a reason</li>
            </ul>
          </article>
          <article className="card glass-panel">
            <div className="card-icon" aria-hidden="true">
              <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3 L6 17 L13.5 17 L12.5 27 L24 13 L16 13 Z" />
              </svg>
            </div>
            <h3>Uncompromising Performance</h3>
            <p>
              Built on modern architecture ensuring your digital presence is as
              fast as it is striking. Every byte shipped has to earn its place,
              and nothing gets added without being measured. Speed isn&apos;t a
              feature — it&apos;s the baseline everything else sits on.
            </p>
            <ul className="card-bullets">
              <li>No build tools, bundlers, or framework runtime to ship</li>
              <li>Images encoded per-route, not uploaded once and forgotten</li>
              <li>Render paths profiled so 60fps holds on older hardware</li>
            </ul>
          </article>
          <article className="card glass-panel">
            <div className="card-icon" aria-hidden="true">
              <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 15 Q 15 5, 27 15 Q 15 25, 3 15 Z" />
                <circle cx="15" cy="15" r="3.2" />
              </svg>
            </div>
            <h3>Radical Transparency</h3>
            <p>
              Direct communication and clear milestones from a dedicated
              engineer who handles every detail. You always know who&apos;s
              working on your project, what they&apos;re doing, and why they
              made the call they did. No account managers, no inherited tickets.
            </p>
            <ul className="card-bullets">
              <li>Source code is yours to keep — not licensed or rented</li>
              <li>No vendor lock-in, no hidden recurring platform fees</li>
              <li>Pricing quoted up front and broken down line by line</li>
            </ul>
          </article>
        </div>
      </section>

      <section
        className="panel reveal"
        style={{ paddingBottom: 0, position: "relative" }}
      >
        <div
          className="parallax-orbs"
          style={{
            overflow: "hidden",
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100vw",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {ORBS.map((orb) => (
            <div
              key={orb.className}
              className={orb.className}
              data-speed={orb.speed}
            ></div>
          ))}
        </div>

        <SplitH2 text="The Arsenal." style={{ position: "relative", zIndex: 2 }} />
        <p
          style={{
            marginBottom: 30,
            opacity: 0.8,
            position: "relative",
            zIndex: 2,
          }}
        >
          The tools and technologies wielded to forge your digital experience.
        </p>
        <div
          className="sticky-skills-container"
          style={{ paddingBottom: "20vh", zIndex: 2 }}
        >
          {SKILLS.map((skill) => (
            <div
              key={skill.name}
              className={`sticky-skill-card ${skill.className}`}
              data-tint={skill.tint}
            >
              {skill.svg}
              <h3>{skill.name}</h3>
              <p>{skill.caption}</p>
              <code
                className="skill-snippet"
                data-snippet={skill.snippet}
                aria-hidden="true"
              ></code>
            </div>
          ))}

          <div
            className="skills-conclusion reveal"
            style={{
              position: "sticky",
              top: 380,
              zIndex: 10,
              marginTop: "5vh",
              textAlign: "center",
              maxWidth: 800,
              marginLeft: "auto",
              marginRight: "auto",
              background: "var(--bg)",
              padding: 30,
              borderRadius: 20,
              border: "1px solid var(--border)",
              boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h3 style={{ fontSize: "2rem", marginBottom: 20 }}>
              The Synthesis.
            </h3>
            <p
              style={{
                fontSize: "1.2rem",
                lineHeight: 1.6,
                opacity: 0.9,
                margin: 0,
              }}
            >
              These aren&apos;t just isolated technologies; they are the
              synchronized instruments of a masterclass orchestra. By weaving
              together responsive <strong>HTML/CSS</strong> with the dynamic
              capabilities of <strong>React</strong> and{" "}
              <strong>Next.js</strong>, powered by a robust{" "}
              <strong>Node.js</strong> backend, every piece of code operates in
              perfect harmony. The result? A digital experience that isn&apos;t
              just visually stunning, it&apos;s fast, scalable, and engineered
              to leave a lasting impression.
            </p>
          </div>
        </div>
      </section>
      <Script src="/skill-cards.js" strategy="afterInteractive" />
    </>
  );
}
