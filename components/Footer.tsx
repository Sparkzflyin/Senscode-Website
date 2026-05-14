import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer-panel">
      <div className="footer-content">
        <section className="footer-column">
          <h4>Explore</h4>
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">About Us</Link>
          <Link href="/blog">Blog</Link>
        </section>
        <section className="footer-column">
          <h4>Support</h4>
          <Link href="/contact">Contact Us</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <a href="#" data-cookie-settings>
            Cookie Settings
          </a>
        </section>
        <section className="footer-column">
          <h4>Connect</h4>
          <a
            href="https://github.com/Sparkzflyin"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
          <a
            href="https://www.instagram.com/thekid_sparks/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/christian-sparks/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://www.credly.com/users/christian-sparks.536305e8"
            target="_blank"
            rel="noopener noreferrer"
          >
            Credly (For certifications)
          </a>
        </section>
      </div>
      <div className="footer-bottom">
        <p>
          © 2026 SensCode. All rights reserved. SensCode is a registered trade
          name of Sensormedia LLC.
        </p>
        <p>A USMC Veteran-Owned Business.</p>
        <p className="founder-byline">
          Designed, coded, deployed, and occasionally cursed at by one stubborn
          Marine in Yuma, Arizona.
        </p>
      </div>
    </footer>
  );
}
