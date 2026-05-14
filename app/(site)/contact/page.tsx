import type { Metadata } from "next";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";
import { ContactForm } from "@/components/ContactForm";
import { Typewriter } from "@/components/Typewriter";
import { SplitH2 } from "@/components/SplitH2";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with SensCode to start your next web design project. Send a message and we'll get back to you within 24 hours.",
  keywords: [
    "contact SensCode",
    "hire web developer",
    "web design project",
    "Christian Sparks contact",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "SensCode | Contact",
    description:
      "Get in touch with SensCode to start your next web design project.",
    url: "/contact",
    type: "website",
    images: [
      {
        url: "/og-card.png",
        width: 2400,
        height: 1260,
        alt: "Contact SensCode to start your next web project",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SensCode | Contact",
    description:
      "Get in touch with SensCode to start your next web design project. Replies within 24 hours.",
    images: ["/og-card.png"],
  },
};

export default function ContactPage() {
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
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "sales",
              url: "https://senscode.com/contact",
              availableLanguage: "English",
              areaServed: "Worldwide",
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
            { name: "Contact", url: "https://senscode.com/contact" },
          ]),
          {
            "@type": "ContactPage",
            "@id": "https://senscode.com/contact#webpage",
            url: "https://senscode.com/contact",
            name: "SensCode | Contact",
            description:
              "Start a project with SensCode. Submit an inquiry and receive a reply within 24 hours.",
            isPartOf: { "@id": "https://senscode.com/#website" },
            about: { "@id": "https://senscode.com/#organization" },
            inLanguage: "en-US",
          },
        ]}
      />

      <header className="hero">
        <div className="hero-content reveal">
          <Typewriter text="Get in touch." />
          <p>Let&apos;s create together.</p>
        </div>
      </header>

      <section className="panel">
        <ContactForm />
      </section>

      <section className="panel reveal next-steps-section">
        <SplitH2 text="After You Hit Send." />
        <p className="next-steps-intro">
          No funnels, no auto-replies, no &ldquo;thanks for your interest in our
          solutions.&rdquo; Here&rsquo;s what actually happens.
        </p>
        <ol className="grid-3 next-steps-grid">
          <li className="card glass-panel next-step">
            <span className="next-step-num">01</span>
            <h3>I read it.</h3>
            <p>
              Within 24 hours. Every message hits my inbox personally — no
              triage queue, no team to loop in, no &ldquo;a representative will
              reach out shortly.&rdquo;
            </p>
          </li>
          <li className="card glass-panel next-step">
            <span className="next-step-num">02</span>
            <h3>Quick clarifications.</h3>
            <p>
              2–3 follow-up questions so I can quote you accurately instead of
              giving a vague &ldquo;it depends&rdquo; non-answer. Plain English,
              no consultant-speak.
            </p>
          </li>
          <li className="card glass-panel next-step">
            <span className="next-step-num">03</span>
            <h3>We hop on a call.</h3>
            <p>
              A 15-minute Zoom or phone call to lock in scope. Free, no
              obligation, no pitch deck. If we&rsquo;re a fit, I&rsquo;ll send a
              written quote within a day.
            </p>
          </li>
        </ol>
      </section>
    </>
  );
}
