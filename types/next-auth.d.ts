import type { DefaultSession } from "next-auth";

export type AppRole = "owner" | "client";

declare module "next-auth" {
  interface User {
    role?: AppRole;
    canAuthorBlog?: boolean;
  }
  interface Session {
    user: {
      id: string;
      role?: AppRole;
      canAuthorBlog?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    canAuthorBlog?: boolean;
  }
}
