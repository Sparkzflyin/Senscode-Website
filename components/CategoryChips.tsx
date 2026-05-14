import Link from "next/link";
import type { CategoryListItem } from "@/sanity/lib/fetch";

type Props = {
  categories: CategoryListItem[];
  activeSlug?: string | null;
};

export function CategoryChips({ categories, activeSlug }: Props) {
  if (categories.length === 0) return null;
  const allActive = !activeSlug;

  return (
    <nav
      aria-label="Filter by category"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        marginBottom: 40,
      }}
    >
      <Link
        href="/blog"
        className="category-chip"
        data-active={allActive ? "true" : "false"}
        aria-current={allActive ? "page" : undefined}
      >
        All
      </Link>
      {categories.map((c) => {
        const isActive = activeSlug === c.slug;
        return (
          <Link
            key={c.slug}
            href={`/blog/category/${c.slug}`}
            className="category-chip"
            data-active={isActive ? "true" : "false"}
            aria-current={isActive ? "page" : undefined}
          >
            {c.title}
            <span style={{ opacity: 0.6, marginLeft: 6, fontSize: "0.85em" }}>
              {c.postCount}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
