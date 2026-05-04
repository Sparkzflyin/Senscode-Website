"use strict";

// Self-contained Algolia search modal. The page only needs to load this
// script with config baked in:
//
//   <script defer src="search.js"
//     data-algolia-app-id="..."
//     data-algolia-search-key="..."
//     data-algolia-index="senscode_site"></script>
//
// The script injects the trigger button into .nav-actions, mounts a <dialog>
// at body end, and lazy-loads the Algolia SDK on first open.

(() => {
  // ---- Config ------------------------------------------------------------
  // Pulls from the current <script> tag's data-* attributes first; falls back
  // to window.SENSCODE_ALGOLIA for any page still using the older pattern.
  const tag = document.currentScript;
  const ds = (tag && tag.dataset) || {};
  const legacy = window.SENSCODE_ALGOLIA || {};
  const cfg = {
    appId: ds.algoliaAppId || legacy.appId,
    searchKey: ds.algoliaSearchKey || legacy.searchKey,
    indexName: ds.algoliaIndex || legacy.indexName,
  };

  const SDK_URL =
    "https://cdn.jsdelivr.net/npm/algoliasearch@5.51.0/dist/lite/builds/browser.umd.js";
  const SDK_SRI =
    "sha384-TXbDqidE5aGch8SZAIkzK8leLwiXej989hHt2OZh7O6o/RxuzAyUvta8yxHyEa9r";

  if (
    !cfg.appId ||
    !cfg.searchKey ||
    !cfg.indexName ||
    cfg.appId.startsWith("REPLACE_")
  ) {
    return; // No valid config — bail silently. Nothing renders.
  }

  // ---- DOM injection -----------------------------------------------------
  // Both inserts target landmarks the layout already provides. If a page
  // doesn't have .nav-actions (unlikely), the trigger just won't render.

  function buildTrigger() {
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "search-trigger";
    trigger.setAttribute("data-search-trigger", "");
    trigger.setAttribute("aria-label", "Search the site");
    trigger.setAttribute("aria-controls", "search-modal");
    trigger.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span>Search</span>
    `;
    return trigger;
  }

  function inject() {
    if (document.getElementById("search-modal")) return; // already mounted
    const navActions = document.querySelector(".nav-actions");
    if (navActions) {
      const themeToggle = navActions.querySelector(".theme-toggle");
      navActions.insertBefore(
        buildTrigger(),
        themeToggle || navActions.firstChild
      );
    }
    // Also mount inside the mobile menu so the trigger is reachable on
    // narrow viewports where .nav-actions is display:none.
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
      const mobileTrigger = buildTrigger();
      mobileTrigger.classList.add("search-trigger--mobile");
      const themeToggle = mobileMenu.querySelector(".theme-toggle");
      mobileMenu.insertBefore(mobileTrigger, themeToggle || null);
    }

    const dialog = document.createElement("dialog");
    dialog.className = "search-modal";
    dialog.id = "search-modal";
    dialog.setAttribute("aria-label", "Site search");
    dialog.innerHTML = `
      <div class="search-modal-panel">
        <div class="search-modal-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            class="search-input"
            data-search-input
            placeholder="Ask a question or search services, FAQ…"
            autocomplete="off"
            spellcheck="false"
            aria-label="Search query"
          />
          <button class="search-modal-close" type="button" data-search-close>Esc</button>
        </div>
        <div class="search-status" data-search-status aria-live="polite">
          Type to search the site.
        </div>
        <div class="search-results" data-search-results></div>
      </div>
    `;
    document.body.appendChild(dialog);
  }

  // ---- SDK lazy loader ---------------------------------------------------
  let sdkPromise = null;
  function loadSdk() {
    if (sdkPromise) return sdkPromise;
    if (window["algoliasearch/lite"]) {
      sdkPromise = Promise.resolve(window["algoliasearch/lite"]);
      return sdkPromise;
    }
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SDK_URL;
      s.integrity = SDK_SRI;
      s.crossOrigin = "anonymous";
      s.referrerPolicy = "no-referrer";
      s.onload = () => {
        const sdk = window["algoliasearch/lite"];
        sdk ? resolve(sdk) : reject(new Error("Algolia SDK global missing"));
      };
      s.onerror = () => reject(new Error("Algolia SDK failed to load"));
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  // Warm the SDK during idle time so the first search feels instant.
  function warmSdk() {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 800));
    idle(() => loadSdk().catch(() => {}));
  }

  // ---- Search wiring -----------------------------------------------------
  function init() {
    inject();
    const triggers = document.querySelectorAll("[data-search-trigger]");
    const modal = document.getElementById("search-modal");
    if (!triggers.length || !modal) return;

    const input = modal.querySelector("[data-search-input]");
    const results = modal.querySelector("[data-search-results]");
    const status = modal.querySelector("[data-search-status]");
    const closeBtn = modal.querySelector("[data-search-close]");

    let client = null;
    let abortToken = 0;
    let debounceTimer = null;
    let lastQuery = "";

    async function ensureClient() {
      if (client) return client;
      const sdk = await loadSdk();
      const liteClient = sdk.liteClient || sdk.algoliasearch || sdk;
      if (typeof liteClient !== "function") {
        throw new Error("Algolia SDK shape unexpected");
      }
      client = liteClient(cfg.appId, cfg.searchKey);
      return client;
    }

    function open() {
      if (modal.open) return;
      if (typeof modal.showModal === "function") {
        modal.showModal();
      } else {
        modal.setAttribute("open", "");
      }
      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });
      ensureClient().catch((err) => {
        console.warn("[senscode] search SDK error:", err);
        status.textContent = "Search is unavailable right now.";
      });
    }

    function close() {
      if (!modal.open) return;
      if (typeof modal.close === "function") {
        modal.close();
      } else {
        modal.removeAttribute("open");
      }
    }

    function escapeHTML(s) {
      return String(s).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c]
      );
    }

    // Algolia returns highlighted snippets with <em>…</em> wrapping matches.
    // Escape every char first so no other markup leaks through, then swap
    // the (now escaped) <em>/</em> tokens for safe <mark> tags.
    function safeHighlight(raw) {
      return escapeHTML(String(raw || ""))
        .replace(/&lt;em&gt;/g, '<mark class="search-mark">')
        .replace(/&lt;\/em&gt;/g, "</mark>");
    }

    function renderResults(hits, query) {
      if (!hits.length) {
        results.innerHTML = "";
        status.textContent = `No results for "${query}"`;
        return;
      }
      status.textContent = `${hits.length} result${hits.length === 1 ? "" : "s"}`;
      results.innerHTML = hits
        .map((hit) => {
          const title = safeHighlight(
            hit._highlightResult?.title?.value || hit.title
          );
          const snippet = safeHighlight(
            hit._snippetResult?.content?.value || hit.content || ""
          );
          const tag = escapeHTML(hit.section || hit.type || "");
          const url = escapeHTML(hit.url || "/");
          return `<a class="search-result" href="${url}" data-result-url="${url}">
            <div class="search-result-meta">
              <span class="search-result-tag">${tag}</span>
            </div>
            <div class="search-result-title">${title}</div>
            <div class="search-result-snippet">${snippet}</div>
          </a>`;
        })
        .join("");
    }

    async function runQuery(query) {
      const token = ++abortToken;
      if (!query.trim()) {
        results.innerHTML = "";
        status.textContent = "Type to search the site.";
        return;
      }
      try {
        const c = await ensureClient();
        const res = await c.search({
          requests: [{ indexName: cfg.indexName, query, hitsPerPage: 8 }],
        });
        if (token !== abortToken) return;
        const hits = res.results?.[0]?.hits || [];
        renderResults(hits, query);
      } catch (err) {
        if (token !== abortToken) return;
        console.warn("[senscode] search error:", err);
        status.textContent = "Search is unavailable right now.";
        results.innerHTML = "";
      }
    }

    input.addEventListener("input", () => {
      const q = input.value;
      if (q === lastQuery) return;
      lastQuery = q;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runQuery(q), 140);
    });

    // Enter on the input jumps to the first result. Mirrors the convention
    // mobile users (and power users) expect from a search palette.
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const first = results.querySelector("[data-result-url]");
      if (!first) return;
      e.preventDefault();
      const href = first.getAttribute("href");
      if (!href) return;
      close();
      window.location.assign(href);
    });

    triggers.forEach((t) => t.addEventListener("click", open));
    closeBtn.addEventListener("click", close);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });

    modal.addEventListener("close", () => {
      results.innerHTML = "";
      status.textContent = "Type to search the site.";
      input.value = "";
      lastQuery = "";
    });

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        modal.open ? close() : open();
      }
    });

    results.addEventListener("click", (e) => {
      if (e.target.closest("[data-result-url]")) close();
    });

    warmSdk();
  }

  // <script defer> guarantees DOM is parsed before this runs, so init now.
  init();
})();
