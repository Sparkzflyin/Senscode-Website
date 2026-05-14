import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";
import { ProjectEstimator } from "@/components/ProjectEstimator";
import { Typewriter } from "@/components/Typewriter";
import { SplitH2 } from "@/components/SplitH2";

export const metadata: Metadata = {
  title: "Web Design & Consulting Services",
  description:
    "Explore SensCode's services: Full Scope web development, Technical Consulting, and Website Repair. High-performance, hand-coded solutions.",
  keywords: [
    "web design services",
    "full stack development",
    "technical consulting",
    "website repair",
    "Christian Sparks",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title: "SensCode | Web Design & Consulting Services",
    description:
      "Explore SensCode's services: Full Scope web development, Technical Consulting, and Website Repair.",
    url: "/services",
    type: "website",
    images: [
      {
        url: "/og-card.png",
        width: 2400,
        height: 1260,
        alt: "SensCode — hand-coded web design and development services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SensCode | Web Design & Consulting Services",
    description:
      "Full Scope web development, technical consulting, and website repair from SensCode. Hand-coded, performance-tuned, fully owned by the client.",
    images: ["/og-card.png"],
  },
};

const SERVICES = [
  {
    tag: "Pro",
    name: "Full Scope",
    desc: "No idea where to start but have a dream? We build your digital presence from the ground up.",
    items: [
      "Custom UI/UX Design",
      "Full-Stack Development",
      "Responsive Mobile Design",
      "SEO & Performance Tuning",
    ],
    price: "Starting at $1000",
  },
  {
    tag: "New",
    name: "Consulting",
    desc: "Have parameters but need your vision technically architected? We provide the blueprint.",
    items: [
      "Architecture Planning",
      "Technology Stack Selection",
      "Code Review & Audits",
      "Scalability Strategy",
    ],
    price: "Starting at $500 + hourly",
  },
  {
    tag: "New",
    name: "Repair",
    desc: "Is your current website underperforming or visually outdated? We breathe new life into it.",
    items: [
      "Performance Optimization",
      "Bug Squashing & Refactoring",
      "Design Modernization",
      "Accessibility Compliance",
    ],
    price: "Starting at $300",
  },
];

const COMPARE_ROWS = [
  {
    label: "Performance",
    us: "Sub-second loads, tuned per browser engine",
    dnd: "Bloated runtime, dozens of unused scripts",
    theme: "Whatever the original author shipped",
    states: ["yes", "no", "meh"] as const,
  },
  {
    label: "Customization",
    us: "Anything you can dream up, no exceptions",
    dnd: "Locked to whatever the editor allows",
    theme: "Forks of forks, fragile to update",
    states: ["yes", "no", "meh"] as const,
  },
  {
    label: "Ownership",
    us: "You own every line. Host it anywhere",
    dnd: "You rent. Leave the platform, lose the site",
    theme: "Licensed code with restrictions",
    states: ["yes", "no", "meh"] as const,
  },
  {
    label: "SEO Control",
    us: "Hand-written semantic HTML, full schema control",
    dnd: "Surface-level fields, opaque markup underneath",
    theme: "SEO is whatever the theme bothered to do",
    states: ["yes", "meh", "no"] as const,
  },
  {
    label: "Long-term Cost",
    us: "Pay once. Hosting options available if desired",
    dnd: "Monthly subscription forever, tier upcharges",
    theme: "Cheap up-front, costly to maintain",
    states: ["yes", "no", "meh"] as const,
  },
  {
    label: "Support",
    us: "The person who built it picks up the phone",
    dnd: "Tier-1 ticket queue, scripted replies",
    theme: "The author moved on three versions ago",
    states: ["yes", "no", "no"] as const,
  },
];

const STATE_MARK = { yes: "✓", no: "✕", meh: "~" } as const;

const FAQS = [
  {
    q: "What stack do you build on, and why?",
    a: "Next.js, Tailwind, Sanity, and Postgres, deployed on Vercel. Boring, modern, and built to still be supported in 2030. I pick tools that ship fast, keep the bundle lean, and survive the platform churn that kills WordPress and Wix sites every few years. You own the codebase outright, no proprietary builder, no platform lock-in, no monthly ransom.",
  },
  {
    q: "Do you work with agencies?",
    a: "I AM the agency. There’s one of me, which is either the best or worst thing depending on what you need. No project managers, no handoffs, no “let me loop in my team.”. No worries though, if there’s one thing the Marine Corps has taught me, it’s how to get sh*t done with limited resources and a lot of caffeine.",
  },
  {
    q: "How long does a project take?",
    a: "Full-scope builds run 3–6 weeks depending on complexity. I don’t over-promise, because I actually have to ship it. Timeline gets locked in writing before we start.",
  },
  {
    q: "What happens after launch?",
    a: "You own the code outright. I hand over the keys and stick around for questions. Retainers are available if you want me on-call for ongoing updates and maintenance. I do retain the right to use the project in my portfolio, but if you want it kept private, that can be arranged too.",
  },
  {
    q: "Do you host the site?",
    a: "Yes and no, I can deploy it to Vercel, Netlify, or wherever you prefer, then hand over the login. You own it forever, no strings attached, no monthly “platform fees” from me OR if you prefer a more hands off approach, I can help with that too for a fee.",
  },
  {
    q: "How does the veteran discount work?",
    a: "Honor system. If you’ve served, 15% comes off the final invoice. No paperwork, no verification rituals, I trust my fellow service members...we'll see how it works out.",
  },
];

export default function ServicesPage() {
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
          breadcrumbLd([
            { name: "Home", url: "https://senscode.com/" },
            { name: "Services", url: "https://senscode.com/services" },
          ]),
          {
            "@type": "Service",
            "@id": "https://senscode.com/services#full-scope",
            name: "Full Scope Web Development",
            serviceType: "Custom website design and development",
            provider: { "@id": "https://senscode.com/#organization" },
            description:
              "End-to-end builds: custom UI/UX design, full-stack development, responsive mobile design, SEO and performance tuning.",
            offers: {
              "@type": "Offer",
              price: "1000",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: "https://senscode.com/contact",
            },
          },
          {
            "@type": "Service",
            "@id": "https://senscode.com/services#consulting",
            name: "Technical Consulting",
            serviceType: "Web architecture and consulting",
            provider: { "@id": "https://senscode.com/#organization" },
            description:
              "Architecture planning, technology stack selection, code review and audits, scalability strategy.",
            offers: {
              "@type": "Offer",
              price: "500",
              priceCurrency: "USD",
              url: "https://senscode.com/contact",
            },
          },
          {
            "@type": "Service",
            "@id": "https://senscode.com/services#repair",
            name: "Website Repair and Modernization",
            serviceType:
              "Website performance, accessibility, and modernization",
            provider: { "@id": "https://senscode.com/#organization" },
            description:
              "Performance optimization, bug squashing and refactoring, design modernization, accessibility compliance.",
            offers: {
              "@type": "Offer",
              price: "300",
              priceCurrency: "USD",
              url: "https://senscode.com/contact",
            },
          },
          {
            "@type": "FAQPage",
            "@id": "https://senscode.com/services#faq",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@type": "WebPage",
            "@id": "https://senscode.com/services#webpage",
            url: "https://senscode.com/services",
            name: "SensCode | Web Design & Consulting Services",
            description:
              "Full Scope web development, technical consulting, and website repair from SensCode. Hand-coded, performance-tuned, fully owned by the client.",
            isPartOf: { "@id": "https://senscode.com/#website" },
            about: { "@id": "https://senscode.com/#organization" },
            inLanguage: "en-US",
          },
        ]}
      />

      <header className="hero">
        <div className="hero-content reveal">
          <Typewriter text="Our Services." />
          <p>Choose excellence.</p>
        </div>
      </header>

      <section className="panel" style={{ paddingTop: 40 }}>
        <div className="grid-3">
          {SERVICES.map((svc) => (
            <article key={svc.name} className="card glass-panel reveal">
              <span className="tag">{svc.tag}</span>
              <h3>{svc.name}</h3>
              <p className="card-desc">{svc.desc}</p>
              <ul className="service-list">
                {svc.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="card-footer">
                <span className="price-hint">{svc.price}</span>
                <Link href="/contact" className="cta-button small-btn">
                  Inquire
                </Link>
              </div>
            </article>
          ))}
          <article
            className="card glass-panel reveal"
            style={{
              gridColumn: "1 / -1",
              padding: 25,
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.95rem" }}>
              Additional charges may apply based on specific project
              requirements.
            </p>
          </article>
        </div>
      </section>

      <section className="panel reveal">
        <div
          className="vets-discount-card card glass-panel"
          style={{ textAlign: "center" }}
        >
          <span className="tag">Vets for Vets</span>
          <h3>A Token of Gratitude</h3>
          <p
            className="card-desc"
            style={{ maxWidth: 600, margin: "15px auto" }}
          >
            As a USMC veteran-owned business, SensCode is honored to offer a{" "}
            <strong>15% discount</strong> on all services to active-duty
            military personnel and veterans. Simply mention your status when you
            inquire. We operate on an honor system, trusting in the integrity of
            our fellow service members.
          </p>
          <div className="card-footer" style={{ justifyContent: "center" }}>
            <Link href="/contact" className="cta-button small-btn">
              Claim Your Discount
            </Link>
          </div>
        </div>
      </section>

      <section className="metrics-banner reveal">
        <div className="metric">
          <span className="metric-value">100%</span>
          <span className="metric-label">Hand-Coded.</span>
        </div>
        <div className="metric">
          {/* TODO(#14): live page load time */}
          <span className="metric-value" id="load-time-val">
            &lt;1s
          </span>
          <span className="metric-label">To load this page for you.</span>
        </div>
        <div className="metric">
          <span className="metric-value">0</span>
          <span className="metric-label">Corporate Bureaucracy.</span>
        </div>
      </section>

      <section className="panel reveal" id="comparison-panel">
        <SplitH2 text="Custom vs. The Cookie-Cutter." />
        <p
          className="card-desc"
          style={{ textAlign: "center", margin: "0 auto 40px", maxWidth: 640 }}
        >
          Why hand-coded actually matters when the bill comes due.
        </p>
        <table className="compare-grid card glass-panel no-spotlight">
          <caption className="visually-hidden">
            Comparison of SensCode hand-coded sites versus drag-and-drop
            builders and theme marketplaces
          </caption>
          <thead>
            <tr className="compare-row compare-head">
              <th className="compare-cell compare-label" scope="col">
                <strong>What Matters</strong>
              </th>
              <th className="compare-cell compare-us" scope="col">
                <span className="tag">SensCode</span>
                <strong>Hand-Coded</strong>
              </th>
              <th className="compare-cell" scope="col">
                <strong>Drag &amp; Drop</strong>
                <span className="compare-sub">Subscription Builders</span>
              </th>
              <th className="compare-cell" scope="col">
                <strong>Theme Marketplaces</strong>
                <span className="compare-sub">ThemeForest, Envato</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.label} className="compare-row">
                <th className="compare-cell compare-label" scope="row">
                  {row.label}
                </th>
                <td
                  className="compare-cell compare-us"
                  data-state={row.states[0]}
                >
                  <span className="compare-mark" aria-hidden="true">
                    {STATE_MARK[row.states[0]]}
                  </span>
                  <span>{row.us}</span>
                </td>
                <td className="compare-cell" data-state={row.states[1]}>
                  <span className="compare-mark" aria-hidden="true">
                    {STATE_MARK[row.states[1]]}
                  </span>
                  <span>{row.dnd}</span>
                </td>
                <td className="compare-cell" data-state={row.states[2]}>
                  <span className="compare-mark" aria-hidden="true">
                    {STATE_MARK[row.states[2]]}
                  </span>
                  <span>{row.theme}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel reveal" style={{ paddingTop: 20 }}>
        <ProjectEstimator />
      </section>

      <section className="panel reveal" style={{ paddingTop: 0 }}>
        <div className="faq-container">
          <SplitH2 text="Questions You’re Probably Thinking." />
          <div className="faq-list">
            {FAQS.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner reveal">
        <SplitH2 text="Ready to realize your vision?" />
        <p>Let&apos;s begin the conversation and build something extraordinary.</p>
        <Link href="/contact" className="cta-button">
          Start Your Project
        </Link>
      </section>
    </>
  );
}
