"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const CONSENT_COOKIE = "senscode_consent";
const CONSENT_VERSION = "1";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "", "::1"]);

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1");
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + escaped + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

declare global {
  interface Window {
    __senscodeAnalyticsLoaded?: boolean;
    SensCookies?: {
      set: typeof setCookie;
      get: typeof getCookie;
      delete: typeof deleteCookie;
      openSettings: () => void;
    };
  }
}

function loadAnalytics() {
  if (LOCAL_HOSTS.has(location.hostname)) return;
  if (window.__senscodeAnalyticsLoaded) return;
  window.__senscodeAnalyticsLoaded = true;
  for (const src of [
    "/_vercel/insights/script.js",
    "/_vercel/speed-insights/script.js",
  ]) {
    const el = document.createElement("script");
    el.defer = true;
    el.src = src;
    document.head.appendChild(el);
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const decideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reopen = useCallback(() => {
    deleteCookie(CONSENT_COOKIE);
    setExiting(false);
    setVisible(true);
  }, []);

  useEffect(() => {
    window.SensCookies = {
      set: setCookie,
      get: getCookie,
      delete: deleteCookie,
      openSettings: reopen,
    };

    const stored = getCookie(CONSENT_COOKIE);
    // One-shot init: cookie state can only be read client-side, so we
    // intentionally sync it into React state on mount. The lint rule warns
    // against cascading renders, but here the setState only fires once per
    // mount based on document.cookie, which the lint engine can't infer.
    if (!stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const [ver, choice] = stored.split(":");
    if (ver !== CONSENT_VERSION) {
      setVisible(true);
      return;
    }
    if (choice === "accepted") loadAnalytics();
  }, [reopen]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("[data-cookie-settings]");
      if (!link) return;
      e.preventDefault();
      reopen();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reopen]);

  const decide = (choice: "accepted" | "declined") => {
    setCookie(CONSENT_COOKIE, `${CONSENT_VERSION}:${choice}`, 365);
    setExiting(true);
    if (decideTimer.current) clearTimeout(decideTimer.current);
    decideTimer.current = setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 350);
    if (choice === "accepted") loadAnalytics();
  };

  if (!visible) return null;

  return (
    <div
      className={`cookie-banner${exiting ? "" : " is-visible"}`}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div className="cookie-banner__inner">
        <div className="cookie-banner__copy">
          <h2 className="cookie-banner__title">Yeah, cookies. Gotta ask.</h2>
          <p className="cookie-banner__text">
            Just two: one to remember you already saw this banner, and
            lightweight analytics so I know which pages actually get read. No ad
            networks, no tracking pixels, no shady third parties. Just one guy
            and his coffee.{" "}
            <Link href="/privacy" className="cookie-banner__link">
              Read the policy
            </Link>
            .
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--ghost"
            onClick={() => decide("declined")}
          >
            Pass
          </button>
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--solid"
            onClick={() => decide("accepted")}
          >
            Sounds fair
          </button>
        </div>
      </div>
    </div>
  );
}
