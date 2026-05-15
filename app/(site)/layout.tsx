import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Playfair_Display, Dancing_Script } from "next/font/google";
import "../globals.css";
import "../senscode.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { BackToTop } from "@/components/BackToTop";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CardTilt } from "@/components/CardTilt";
import { FooterCurtain } from "@/components/FooterCurtain";
import { Magnetic } from "@/components/Magnetic";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://senscode.com"),
  title: {
    default: "SensCode | Premium Web Design",
    template: "%s | SensCode",
  },
  description:
    "SensCode offers premium, hand-coded web design and development services by Christian Sparks. Experience next-generation aesthetic beauty.",
  keywords: [
    "web design",
    "web development",
    "SensCode",
    "Christian Sparks",
    "custom websites",
    "front-end development",
    "Yuma web design",
    "UI/UX",
  ],
  authors: [{ name: "Christian Sparks" }],
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "SensCode",
    locale: "en_US",
    url: "/",
    title: "SensCode | Premium Web Design & Development",
    description:
      "SensCode offers premium, hand-coded web design and development services by Christian Sparks.",
    images: [
      {
        url: "/og-card.png",
        width: 2400,
        height: 1260,
        alt: "SensCode — hand-coded web design and development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SensCode | Premium Web Design & Development",
    description:
      "SensCode offers premium, hand-coded web design and development services by Christian Sparks.",
    images: ["/og-card.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  other: {
    "geo.region": "US-AZ",
    "geo.placename": "Yuma",
    "geo.position": "32.6927;-114.6277",
    ICBM: "32.6927, -114.6277",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}
    >
      <body>
        {/* No-FOUC theme init — external sync script runs before the rest of
            <body> renders, so the stored localStorage theme applies before
            paint. External-src avoids the React 19 dev warning that
            `dangerouslySetInnerHTML` on `<script>` triggers. */}
        <script src="/theme-init.js" />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <AuthProvider>
          <SmoothScroll />
          <ScrollReveal />
          <CardTilt />
          <Magnetic />
          <FooterCurtain />
          <div className="curtain-wrapper">
            <Navbar />
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <CookieBanner />
            <BackToTop />
          </div>
          <Footer />
        </AuthProvider>
        <Script src="/legacy-effects.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
