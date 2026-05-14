import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return session;
}

export async function requireOwner() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (session.user.role !== "owner") redirect("/dashboard");
  return session;
}
