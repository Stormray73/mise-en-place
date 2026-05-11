/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import DashboardHub from "@/app/dashboard/page";
import { expect, test, vi } from "vitest";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock meal-plans
vi.mock("@/lib/meal-plans", () => ({
  getWeeklyMealPlan: vi.fn().mockResolvedValue([]),
  getPrepAheadData: vi.fn().mockResolvedValue([]),
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

test("Dashboard Hub redirects to login if no session", async () => {
  vi.mocked(auth as any).mockResolvedValue(null as unknown as Session);

  try {
    await DashboardHub();
  } catch (e: unknown) {
    if (e instanceof Error) {
      expect(e.message).toBe("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/login");
    } else {
      throw e;
    }
  }
});

test("Dashboard Hub renders title and welcome message", async () => {
  vi.mocked(auth as any).mockResolvedValue({
    user: { id: "user1", name: "Chef Gordon" },
    expires: "2026-01-01",
  } as Session);

  const DashboardComponent = await DashboardHub();
  render(DashboardComponent);

  expect(screen.getByText(/Kitchen Command Center/i)).toBeInTheDocument();
  expect(screen.getByText(/Chef Chef Gordon/i)).toBeInTheDocument();
});

test("Dashboard Hub shows empty state when no meals planned", async () => {
  vi.mocked(auth as any).mockResolvedValue({
    user: { id: "user1", name: "Chef Gordon" },
    expires: "2026-01-01",
  } as Session);

  const { getWeeklyMealPlan } = await import("@/lib/meal-plans");
  vi.mocked(getWeeklyMealPlan).mockResolvedValue([]);

  const DashboardComponent = await DashboardHub();
  render(DashboardComponent);

  expect(screen.getByText(/Nothing planned for today/i)).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Start planning!/i }),
  ).toBeInTheDocument();
});

test("Dashboard Hub shows today's meals", async () => {
  vi.mocked(auth as any).mockResolvedValue({
    user: { id: "user1", name: "Chef Gordon" },
    expires: "2026-01-01",
  } as Session);

  const today = new Date();
  const mockMeals = [
    {
      id: "m1",
      date: today,
      slot: "Dinner",
      macros: { calories: 500, protein: 20, fat: 15, carbs: 60 },
      plannedRecipes: [
        {
          id: "pr1",
          recipeId: "r1",
          scale: 2,
          recipe: { title: "Pasta" },
        },
      ],
    },
  ];

  const { getWeeklyMealPlan } = await import("@/lib/meal-plans");
  vi.mocked(getWeeklyMealPlan).mockResolvedValue(mockMeals as any);

  const DashboardComponent = await DashboardHub();
  render(DashboardComponent);

  expect(screen.getByText(/Pasta/i)).toBeInTheDocument();
  expect(screen.getByText(/Scale: 2x/i)).toBeInTheDocument();
  expect(screen.getByText(/500 kcal/i)).toBeInTheDocument();
});
