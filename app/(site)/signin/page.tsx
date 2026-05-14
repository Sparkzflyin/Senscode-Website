import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your SensCode account.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <section className="panel">
      <div
        className="contact-card reveal"
        style={{ maxWidth: 480, margin: "clamp(80px, 12vh, 160px) auto 0" }}
      >
        <header className="contact-header">
          <span className="tag">Account</span>
          <h2>Sign in.</h2>
          <p>Use the credentials Christian sent you.</p>
        </header>
        <SignInForm />
      </div>
    </section>
  );
}
