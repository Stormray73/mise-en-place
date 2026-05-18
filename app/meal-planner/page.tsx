import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getWeeklyMealPlan } from "@/lib/meal-plans";
import Link from "next/link";
import MealCalendarClient from "./MealCalendarClient";
import PrepAheadDashboard from "./PrepAheadDashboard";
import { prisma } from "@/lib/prisma";

export default async function MealPlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { date } = await searchParams;
  const initialDate = date ? new Date(date) : new Date();

  // Normalize to start of week (Sunday)
  const startDate = new Date(initialDate);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const meals = await getWeeklyMealPlan(session.user.id, startDate);

  const allRecipes = await prisma.recipe.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true },
  });

  return (
    <div className="w-full px-4 md:px-8 py-8 space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meal Planner</h1>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      <PrepAheadDashboard
        startDate={startDate.toISOString()}
        endDate={endDate.toISOString()}
      />

      <MealCalendarClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialMeals={meals as any}
        startDate={startDate.toISOString()}
        allRecipes={allRecipes}
      />
    </div>
  );
}
