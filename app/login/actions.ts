"use server";

import { signIn } from "@/auth";

export async function loginAction() {
  try {
    await signIn("credentials", {
      username: "chef",
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // In NextAuth v5, signIn throws a redirect error on success
    // which is caught by Next.js. We should re-throw it.
    if (error instanceof Error && error.constructor.name === "RedirectError") {
      throw error;
    }
    // Check for NEXT_REDIRECT string in error message/digest as well
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    throw error;
  }
}
