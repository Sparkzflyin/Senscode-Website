"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export function DashboardNav({ role }: { role: "owner" | "client" }) {
  const pathname = usePathname();

  const items: NavItem[] =
    role === "owner"
      ? [
          { href: "/dashboard", label: "Overview", exact: true },
          { href: "/dashboard/orders", label: "Orders" },
          { href: "/dashboard/clients", label: "Clients" },
        ]
      : [
          { href: "/dashboard", label: "Overview", exact: true },
          { href: "/dashboard/orders", label: "Your orders" },
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
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
