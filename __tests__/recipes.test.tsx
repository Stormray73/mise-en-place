/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import RecipesPage from "@/app/recipes/page";
import { expect, test, vi } from "vitest";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    recipe: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error("NEXT_REDIRECT") as Error & { digest?: string };
    error.digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw error;
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}));

test("Recipes page redirects to login if no session", async () => {
  // Use any to bypass NextAuth's complex function overloads in the mock
  vi.mocked(auth as any).mockResolvedValue(null as unknown as Session);

  try {
    await RecipesPage({ searchParams: Promise.resolve({}) });
  } catch (e: unknown) {
    if (e instanceof Error) {
      expect(e.message).toBe("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/login");
    } else {
      throw e;
    }
  }
});

test("Recipes page renders title if session exists", async () => {
  // Use any to bypass NextAuth's complex function overloads in the mock
  vi.mocked(auth as any).mockResolvedValue({
    user: { id: "user1", name: "Chef Gordon" },
    expires: "2026-01-01",
  } as Session);

  const RecipesComponent = await RecipesPage({
    searchParams: Promise.resolve({}),
  });
  render(RecipesComponent);

  expect(screen.getByText(/My Recipes/i)).toBeInTheDocument();
});

test("Recipes page renders search bar", async () => {
  vi.mocked(auth as any).mockResolvedValue({
    user: { id: "user1", name: "Chef Gordon" },
    expires: "2026-01-01",
  } as Session);

  const RecipesComponent = await RecipesPage({
    searchParams: Promise.resolve({}),
  });
  render(RecipesComponent);

  expect(screen.getByPlaceholderText(/Search recipes.../i)).toBeInTheDocument();
});

test("Recipes page filters recipes when query is provided", async () => {
  vi.mocked(auth as any).mockResolvedValue({
    user: { id: "user1", name: "Chef Gordon" },
    expires: "2026-01-01",
  } as Session);

  const mockRecipes = [
    { id: "1", title: "Pasta", yieldAmount: 1, yieldUnit: "serving" },
  ];
  vi.mocked(prisma.recipe.findMany).mockResolvedValue(mockRecipes as any);

  await RecipesPage({ searchParams: Promise.resolve({ q: "Pasta" }) });

  expect(prisma.recipe.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        title: {
          contains: "Pasta",
          mode: "insensitive",
        },
      }),
    }),
  );
});
