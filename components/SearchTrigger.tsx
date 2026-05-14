"use client";

import { useEffect, useRef, useState } from "react";

const ALGOLIA_APP_ID =
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "MCQLL7T01W";
const ALGOLIA_SEARCH_KEY =
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ||
  "93f684841e21e29ec977fb25e364c2d1";
const ALGOLIA_INDEX =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX || "senscode_site";

type Hit = {
  objectID?: string;
  title?: string;
  content?: string;
  url?: string;
  section?: string;
  type?: string;
  _highlightResult?: { title?: { value?: string } };
  _snippetResult?: { content?: { value?: string } };
};

function escapeHTML(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );
}

function safeHighlight(raw: string) {
  return escapeHTML(raw || "")
    .replace(/&lt;em&gt;/g, '<mark class="search-mark">')
    .replace(/&lt;\/em&gt;/g, "</mark>");
}

type AlgoliaClient = {
  search: (params: {
    requests: Array<{ indexName: string; query: string; hitsPerPage: number }>;
  }) => Promise<{ results: Array<{ hits: Hit[] }> }>;
};

export function SearchTrigger({
  className = "",
}: {
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const clientRef = useRef<AlgoliaClient | null>(null);
  const tokenRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef("");

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState("Type to search the site.");

  const ensureClient = async () => {
    if (clientRef.current) return clientRef.current;
    const mod = await import("algoliasearch/lite");
    const liteClient = mod.liteClient;
    clientRef.current = liteClient(
      ALGOLIA_APP_ID,
      ALGOLIA_SEARCH_KEY,
    ) as unknown as AlgoliaClient;
    return clientRef.current;
  };

  const open = () => {
    const dlg = dialogRef.current;
    if (!dlg || dlg.open) return;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    ensureClient().catch((err) => {
      console.warn("[senscode] search SDK error:", err);
      setStatus("Search is unavailable right now.");
    });
  };

  const close = () => {
    const dlg = dialogRef.current;
    if (!dlg || !dlg.open) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  };

  const runQuery = async (q: string) => {
    const token = ++tokenRef.current;
    if (!q.trim()) {
      setHits([]);
      setStatus("Type to search the site.");
      return;
    }
    try {
      const client = await ensureClient();
      const res = await client.search({
        requests: [{ indexName: ALGOLIA_INDEX, query: q, hitsPerPage: 8 }],
      });
      if (token !== tokenRef.current) return;
      const list = res.results?.[0]?.hits || [];
      setHits(list);
      setStatus(
        list.length === 0
          ? `No results for "${q}"`
          : `${list.length} result${list.length === 1 ? "" : "s"}`,
      );
    } catch (err) {
      if (token !== tokenRef.current) return;
      console.warn("[senscode] search error:", err);
      setStatus("Search is unavailable right now.");
      setHits([]);
    }
  };

  useEffect(() => {
    if (query === lastQueryRef.current) return;
    lastQueryRef.current = query;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runQuery(query), 140);
    // runQuery is intentionally omitted — its identity changes every render
    // but its behavior is keyed entirely off `query`, so re-subscribing on
    // every identity flip would just reset the debounce timer for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const dlg = dialogRef.current;
        if (dlg?.open) close();
        else open();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // open/close are inline closures that only touch refs + state setters
    // (all stable). Re-binding the keydown listener every render would be
    // pure overhead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const idle =
      (
        window as unknown as {
          requestIdleCallback?: (cb: () => void) => void;
        }
      ).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 800));
    idle(() => {
      ensureClient().catch(() => {});
    });
  }, []);

  return (
    <>
      <button
        type="button"
        className={`search-trigger ${className}`.trim()}
        data-search-trigger
        aria-label="Search the site"
        aria-controls="search-modal"
        onClick={open}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Search</span>
      </button>

      <dialog
        ref={dialogRef}
        className="search-modal"
        id="search-modal"
        aria-label="Site search"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        onClose={() => {
          setHits([]);
          setStatus("Type to search the site.");
          setQuery("");
          lastQueryRef.current = "";
        }}
      >
        <div className="search-modal-panel">
          <div className="search-modal-input-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              className="search-input"
              data-search-input
              placeholder="Ask a question or search services, FAQ…"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                const first = hits[0];
                if (!first?.url) return;
                e.preventDefault();
                close();
                window.location.assign(first.url);
              }}
            />
            <button
              className="search-modal-close"
              type="button"
              data-search-close
              onClick={close}
            >
              Esc
            </button>
          </div>
          <div
            className="search-status"
            data-search-status
            aria-live="polite"
          >
            {status}
          </div>
          <div className="search-results" data-search-results>
            {hits.map((hit, i) => {
              const titleHtml = safeHighlight(
                hit._highlightResult?.title?.value || hit.title || "",
              );
              const snippetHtml = safeHighlight(
                hit._snippetResult?.content?.value || hit.content || "",
              );
              const tag = hit.section || hit.type || "";
              const url = hit.url || "/";
              return (
                <a
                  key={hit.objectID || `${url}-${i}`}
                  className="search-result"
                  href={url}
                  data-result-url={url}
                  onClick={close}
                >
                  <div className="search-result-meta">
                    <span className="search-result-tag">{tag}</span>
                  </div>
                  <div
                    className="search-result-title"
                    dangerouslySetInnerHTML={{ __html: titleHtml }}
                  />
                  <div
                    className="search-result-snippet"
                    dangerouslySetInnerHTML={{ __html: snippetHtml }}
                  />
                </a>
              );
            })}
          </div>
        </div>
      </dialog>
    </>
  );
}
