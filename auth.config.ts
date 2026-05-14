import type { NextAuthConfig } from "next-auth";

// Edge-runtime safe — no DB imports, no Node-only APIs. This config is what
// middleware.ts uses to gate routes. The full config (auth.ts) extends this
// with the Credentials provider (which uses bcryptjs + DB lookup and lives
// in the Node runtime).

export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id;
        token.role = (user as { role?: "owner" | "client" }).role;
        token.canAuthorBlog = (
          user as { canAuthorBlog?: boolean }
        ).canAuthorBlog;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        if (token.id) session.user.id = token.id as string;
        if (token.role)
          session.user.role = token.role as "owner" | "client";
        session.user.canAuthorBlog = Boolean(token.canAuthorBlog);
      }
      return session;
    },
  },
  providers: [], // Credentials added in auth.ts (Node runtime only)
} satisfies NextAuthConfig;
