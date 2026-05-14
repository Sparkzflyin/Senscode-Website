import type { NavbarProps } from "sanity";

// Custom Studio navbar that renders Sanity's default chrome and adds a
// fixed-position "View site" link in the top-right corner. The link
// opens the public blog in a new tab so the user doesn't lose their
// place in Studio.
export function StudioNavbar(props: NavbarProps) {
  return (
    <>
      {props.renderDefault(props)}
      <a
        href="/blog"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View site (opens in new tab)"
        style={{
          position: "fixed",
          top: 12,
          right: 16,
          zIndex: 1000,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 999,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          background: "rgba(255, 255, 255, 0.06)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 500,
          textDecoration: "none",
          backdropFilter: "blur(6px)",
          transition: "background 150ms ease, border-color 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
        }}
      >
        <span>View site</span>
        <span aria-hidden="true">↗</span>
      </a>
    </>
  );
}
