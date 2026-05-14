"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type SignInState = {
  error?: string;
};

export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return { error: "Wrong email or password." };
      }
      return { error: "Something went wrong. Try again." };
    }
    // Next.js redirect() throws — must re-throw so it propagates.
    throw err;
  }
}
