"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

// Reuses the .theme-toggle class so it visually pairs with the rest of the
// nav-actions buttons (search, theme). Renders nothing during the brief
// "loading" window to avoid a Sign In → Dashboard flicker for logged-in
// users on first paint.
export function AuthCTA({
  className,
  style,
  onNavigate,
}: {
  className?: string;
  style?: React.CSSProperties;
  onNavigate?: () => void;
}) {
  const { data: session, status } = useSession();
  if (status === "loading") return null;

  const isAuthed = !!session?.user;
  const href = isAuthed ? "/dashboard" : "/signin";
  const label = isAuthed ? "Dashboard" : "Sign In";

  return (
    <Link
      href={href}
      className={`theme-toggle ${className ?? ""}`.trim()}
      style={style}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}
