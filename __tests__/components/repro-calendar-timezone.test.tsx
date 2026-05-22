// __tests__/components/repro-calendar-timezone.test.tsx
import { render, screen } from "@testing-library/react";
import MealCalendarClient from "@/app/meal-planner/MealCalendarClient";
import { expect, test, vi, describe, beforeAll } from "vitest";
import React from "react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/meal-planner",
}));

describe("MealCalendarClient Timezone Resilience", () => {
  beforeAll(() => {
    // Set environment variable to America/New_York to simulate negative timezone offset
    process.env.TZ = "America/New_York";
  });

  test("displays Sunday as the first day of the week under negative timezone offsets", () => {
    const mockStartDate = "2026-05-10T00:00:00.000Z"; // A UTC Sunday midnight
    const mockAllRecipes = [{ id: "r1", title: "Pasta" }];
    const mockMeals = [
      {
        id: "m1",
        date: "2026-05-10T00:00:00.000Z",
        slot: "Dinner",
        mealPlanId: "mp1",
        createdAt: new Date(),
        updatedAt: new Date(),
        plannedRecipes: [],
        macros: { calories: 0, protein: 0, fat: 0, carbs: 0 },
      },
    ];

    render(
      <MealCalendarClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialMeals={mockMeals as any}
        startDate={mockStartDate}
        allRecipes={mockAllRecipes}
      />,
    );

    // Get all rendered day headers
    // Currently, if start is 2026-05-10T00:00:00Z and client is America/New_York,
    // We expect the first day in the calendar to be Sunday ('Sun').
    const dayNameElements = screen.getAllByText(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/);
    const dayNames = dayNameElements.map((el) => el.textContent?.trim());

    // The first column header should be 'Sun' (Sunday)
    expect(dayNames[0]).toBe("Sun");
  });
});
