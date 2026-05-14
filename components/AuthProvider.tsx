"use client";

import { SessionProvider } from "next-auth/react";

// Thin wrapper so the server-side layout can still be static — only the
// client-side parts that need session info (e.g. the Navbar's Sign In /
// Dashboard CTA) get the provider context.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}
