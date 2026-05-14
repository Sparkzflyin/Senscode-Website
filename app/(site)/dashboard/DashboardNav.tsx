"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  badge?: number;
};

export function DashboardNav({
  role,
  pendingPostCount = 0,
}: {
  role: "owner" | "client";
  pendingPostCount?: number;
}) {
  const pathname = usePathname();

  const items: NavItem[] =
    role === "owner"
      ? [
          { href: "/dashboard", label: "Overview", exact: true },
          { href: "/dashboard/orders", label: "Orders" },
          { href: "/dashboard/clients", label: "Clients" },
          {
            href: "/dashboard/pending-posts",
            label: "Pending posts",
            badge: pendingPostCount,
          },
          { href: "/dashboard/account", label: "Account" },
        ]
      : [
          { href: "/dashboard", label: "Overview", exact: true },
          { href: "/dashboard/orders", label: "Your orders" },
          { href: "/dashboard/account", label: "Account" },
        ];

  return (
    <nav className="dashboard-nav" aria-label="Dashboard navigation">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`dashboard-nav-link${active ? " is-active" : ""}`}
          >
            <span>{item.label}</span>
            {item.badge ? (
              <span className="dashboard-nav-badge">{item.badge}</span>
            ) : null}
          </Link>
        );
      })}
      <hr className="dashboard-nav-divider" />
      <Link
        href="/blog"
        className="dashboard-nav-link dashboard-nav-link--external"
      >
        <span>View blog</span>
        <span aria-hidden="true">↗</span>
      </Link>
    </nav>
  );
}
