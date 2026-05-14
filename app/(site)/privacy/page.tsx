import type { Metadata } from "next";
import { JsonLd, ORGANIZATION_LD, breadcrumbLd } from "@/lib/jsonLd";
import { Typewriter } from "@/components/Typewriter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Privacy Policy for SensCode. Learn how your personal information is collected, used, and protected.",
  keywords: [
    "privacy policy",
    "SensCode privacy",
    "terms of service",
    "Christian Sparks",
  ],
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "SensCode | Privacy Policy",
    description:
      "Read the Privacy Policy for SensCode. Learn how your personal information is collected, used, and protected.",
    url: "/privacy",
    type: "website",
    images: [
      { url: "/og-card.png", width: 2400, height: 1260, alt: "SensCode — Privacy Policy" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SensCode | Privacy Policy",
    description: "How SensCode collects, uses, and protects personal information.",
    images: ["/og-card.png"],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        graph={[
          ORGANIZATION_LD,
          breadcrumbLd([
            { name: "Home", url: "https://senscode.com/" },
            { name: "Privacy Policy", url: "https://senscode.com/privacy" },
          ]),
          {
            "@type": "WebPage",
            "@id": "https://senscode.com/privacy#webpage",
            url: "https://senscode.com/privacy",
            name: "SensCode | Privacy Policy",
            description:
              "How SensCode collects, uses, and protects personal information.",
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
            text="Privacy Policy"
            className="reveal"
            style={{ marginTop: 10 }}
          />

          <p className="story-text left-align">
            This Privacy Policy governs your use of the website located at
            Senscode.com and any services provided by Sensormedia LLC, doing
            business as (DBA) SensCode (&apos;the Company&apos;, &apos;we&apos;,
            &apos;us&apos;, &apos;or&apos;, &apos;our&apos;).
          </p>

          <p className="story-text left-align">
            Last updated: <time dateTime="2026-03">March 2026</time>
            <br />
            <br />
            SensorMedia LLC (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
            is committed to protecting your privacy. This Privacy Policy
            explains how your personal information is collected, used, and
            disclosed by SensCode.
          </p>

          <h3 style={{ marginTop: 40, marginBottom: 10 }}>
            Information we collect
          </h3>
          <p className="story-text left-align">
            We collect information you provide directly to us when you fill out
            a form, request customer support, or otherwise communicate with us.
            The types of information we may collect include your name, email
            address, postal address, and other contact or identifying
            information you choose to provide.
          </p>

          <h3 style={{ marginTop: 40, marginBottom: 10 }}>
            How we use your information
          </h3>
          <p className="story-text left-align">
            We use the information we collect to provide, maintain, and improve
            our services, to develop new ones, and to protect SensCode and our
            users.
          </p>

          <h3 style={{ marginTop: 40, marginBottom: 10 }}>
            Cookies and similar technologies
          </h3>
          <p className="story-text left-align">
            We use a small number of cookies to keep this site running and to
            understand which pages get the most use. We do not sell your data,
            we do not run ad-network trackers, and we do not embed third-party
            tracking pixels. The cookies you may encounter on this site fall
            into two categories:
          </p>
          <p className="story-text left-align">
            <strong>Strictly necessary.</strong> A{" "}
            <code>senscode_consent</code> cookie remembers your answer to the
            consent banner so we don&apos;t ask you again on every page load. It
            stores only your choice (&quot;accepted&quot; or &quot;declined&quot;)
            and a version number, expires after one year, and is set the first
            time you interact with the banner. We also use browser local storage
            (not a cookie) to remember your color theme and reduced-motion
            preference so the site looks the way you left it.
          </p>
          <p className="story-text left-align">
            <strong>Analytics (optional).</strong> When you accept, we load
            Vercel Web Analytics and Vercel Speed Insights. These count page
            views, measure performance, and report aggregate trends. They are
            cookieless on our setup, but they do issue network requests that
            include your IP address and user agent. If you decline, these
            scripts are never loaded.
          </p>
          <p className="story-text left-align">
            You can change your mind at any time by clicking{" "}
            <a href="#" data-cookie-settings>
              Cookie Settings
            </a>{" "}
            in the footer. That clears your saved choice and re-opens the
            banner so you can pick again.
          </p>
        </div>
      </section>
    </>
  );
}
