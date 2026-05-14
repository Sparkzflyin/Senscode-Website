import type { Metadata } from "next";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";
import { Typewriter } from "@/components/Typewriter";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Review the Terms of Use for accessing and using the SensCode website and services.",
  keywords: [
    "terms of use",
    "terms of service",
    "SensCode terms",
    "website terms",
  ],
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "SensCode | Terms of Use",
    description:
      "Review the Terms of Use for accessing and using the SensCode website and services.",
    url: "/terms",
    type: "website",
    images: [
      { url: "/og-card.png", width: 2400, height: 1260, alt: "SensCode — Terms of Use" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SensCode | Terms of Use",
    description:
      "Terms governing access to and use of the SensCode website and services.",
    images: ["/og-card.png"],
  },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd
        graph={[
          ORGANIZATION_LD,
          breadcrumbLd([
            { name: "Home", url: "https://senscode.com/" },
            { name: "Terms of Use", url: "https://senscode.com/terms" },
          ]),
          {
            "@type": "WebPage",
            "@id": "https://senscode.com/terms#webpage",
            url: "https://senscode.com/terms",
            name: "SensCode | Terms of Use",
            description:
              "Terms governing access to and use of the SensCode website and services.",
            isPartOf: { "@id": "https://senscode.com/#website" },
            publisher: { "@id": "https://senscode.com/#organization" },
            inLanguage: "en-US",
          },
        ]}
      />
      <section className="panel">
        <div
          className="founder-note"
          style={{ textAlign: "left", maxWidth: 800, margin: "0 auto" }}
        >
          <span className="tag reveal">Legal Information</span>
          <Typewriter
            as="h2"
            text="Terms of Use"
            className="reveal"
            style={{ marginTop: 10 }}
          />

          <p className="story-text left-align">
            These Terms of Service govern your use of the website located at
            Senscode.com and any services provided by Sensormedia LLC, doing
            business as (DBA) SensCode (&apos;the Company&apos;, &apos;we&apos;,
            &apos;us&apos;, or &apos;our&apos;).
          </p>

          <p className="story-text left-align">
            Last updated: <time dateTime="2026-03">March 2026</time>
            <br />
            <br />
            Please read these Terms of Use carefully before using the SensCode
            website and services.
          </p>

          <h3 style={{ marginTop: 40, marginBottom: 10 }}>
            Acceptance of terms
          </h3>
          <p className="story-text left-align">
            By accessing and using this website, you accept and agree to be
            bound by the terms and provision of this agreement. In addition,
            when using these particular services, you shall be subject to any
            posted guidelines or rules applicable to such services.
          </p>

          <h3 style={{ marginTop: 40, marginBottom: 10 }}>Use of site</h3>
          <p className="story-text left-align">
            You may use our site and services only for lawful purposes. You
            agree not to use our site in any way that violates any applicable
            local, state, national or international law or regulation.
          </p>
        </div>
      </section>
    </>
  );
}
