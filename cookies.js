// Consent banner, cookie helpers, and gated loader for Vercel Analytics
// + Speed Insights. Analytics scripts only load after the visitor accepts.
(() => {
  const CONSENT_COOKIE = "senscode_consent";
  const CONSENT_VERSION = "1";
  const LOCAL_HOSTS = new Set([
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "",
    "::1",
  ]);

  const setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      `${name}=${encodeURIComponent(value)}; expires=${expires};` +
      ` path=/; SameSite=Lax${secure}`;
  };

  const getCookie = (name) => {
    const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1");
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + escaped + "=([^;]*)"),
    );
    return match ? decodeURIComponent(match[1]) : null;
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  };

  const loadAnalytics = () => {
    if (LOCAL_HOSTS.has(location.hostname)) return;
    if (window.__senscodeAnalyticsLoaded) return;
    window.__senscodeAnalyticsLoaded = true;
    const sources = [
      "/_vercel/insights/script.js",
      "/_vercel/speed-insights/script.js",
    ];
    for (const src of sources) {
      const el = document.createElement("script");
      el.defer = true;
      el.src = src;
      document.head.appendChild(el);
    }
  };

  const buildBanner = () => {
    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML = `
      <div class="cookie-banner__inner">
        <div class="cookie-banner__copy">
          <h2 class="cookie-banner__title">Yeah, cookies. Gotta ask.</h2>
          <p class="cookie-banner__text">
            Just two: one to remember you already saw this banner, and
            lightweight analytics so I know which pages actually get read.
            No ad networks, no tracking pixels, no shady third parties.
            Just one guy and his coffee.
            <a href="/privacy" class="cookie-banner__link">Read the policy</a>.
          </p>
        </div>
        <div class="cookie-banner__actions">
          <button type="button" class="cookie-banner__btn cookie-banner__btn--ghost" data-consent="declined">Pass</button>
          <button type="button" class="cookie-banner__btn cookie-banner__btn--solid" data-consent="accepted">Sounds fair</button>
        </div>
      </div>
    `;
    return banner;
  };

  const showBanner = () => {
    if (document.querySelector(".cookie-banner")) return;
    const banner = buildBanner();
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add("is-visible"));
    banner.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-consent]");
      if (!btn) return;
      const choice = btn.dataset.consent;
      setCookie(CONSENT_COOKIE, `${CONSENT_VERSION}:${choice}`, 365);
      banner.classList.remove("is-visible");
      setTimeout(() => banner.remove(), 350);
      if (choice === "accepted") loadAnalytics();
    });
  };

  const reopenBanner = () => {
    deleteCookie(CONSENT_COOKIE);
    const existing = document.querySelector(".cookie-banner");
    if (existing) existing.remove();
    showBanner();
  };

  window.SensCookies = {
    set: setCookie,
    get: getCookie,
    delete: deleteCookie,
    openSettings: reopenBanner,
  };

  const init = () => {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-cookie-settings]");
      if (!link) return;
      e.preventDefault();
      reopenBanner();
    });

    const stored = getCookie(CONSENT_COOKIE);
    if (!stored) {
      showBanner();
      return;
    }
    const [ver, choice] = stored.split(":");
    if (ver !== CONSENT_VERSION) {
      showBanner();
      return;
    }
    if (choice === "accepted") loadAnalytics();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
