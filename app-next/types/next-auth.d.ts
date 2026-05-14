import type { DefaultSession } from "next-auth";

export type AppRole = "owner" | "client";

declare module "next-auth" {
  interface User {
    role?: AppRole;
  }
  interface Session {
    user: {
      id: string;
      role?: AppRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
  }
}
