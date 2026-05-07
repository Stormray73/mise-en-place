/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import Dashboard from "@/app/dashboard/page";
import { expect, test, vi } from "vitest";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error("NEXT_REDIRECT") as Error & { digest?: string };
    error.digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw error;
  }),
}));

test("Dashboard redirects to login if no session", async () => {
  // Use any to bypass NextAuth's complex function overloads in the mock
  vi.mocked(auth as any).mockResolvedValue(null as unknown as Session);

  try {
    await Dashboard();
  } catch (e: unknown) {
    if (e instanceof Error) {
      expect(e.message).toBe("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/login");
    } else {
      throw e;
    }
  }
});

test("Dashboard renders welcome message if session exists", async () => {
  // Use any to bypass NextAuth's complex function overloads in the mock
  vi.mocked(auth as any).mockResolvedValue({
    user: { name: "Chef Gordon" },
    expires: "2026-01-01",
  } as Session);

  const DashboardComponent = await Dashboard();
  render(DashboardComponent);

  expect(screen.getByText(/Welcome, Chef Gordon!/i)).toBeInTheDocument();
});
