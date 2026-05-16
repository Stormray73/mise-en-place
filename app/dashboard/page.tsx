import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getWeeklyMealPlan, getPrepAheadData } from "@/lib/meal-plans";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardHub() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch today's meals
  const meals = await getWeeklyMealPlan(session.user.id, today);
  const todaysMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.date);
    return mealDate.toDateString() === today.toDateString();
  });

  // Fetch immediate prep (next 24 hours)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const prepData = await getPrepAheadData(session.user.id, today, tomorrow);
  const immediatePrep = prepData.filter((item) => !item.completed).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Ready to cook, Chef {session.user?.name}?
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/recipes/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Recipe
          </Link>
          <Link
            href="/meal-planner"
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Plan Meal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left/Center Columns: Today's Schedule */}
        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Today&apos;s Meals
            </h2>

            {todaysMeals.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                Nothing planned for today.{" "}
                <Link
                  href="/meal-planner"
                  className="text-blue-500 hover:underline"
                >
                  Start planning!
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {todaysMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-6"
                  >
                    <h3 className="text-xs font-bold text-blue-400 uppercase mb-4">
                      {meal.slot}
                    </h3>
                    <div className="space-y-4">
                      {meal.plannedRecipes.map((pr) => (
                        <div
                          key={pr.id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <Link
                              href={`/recipes/${pr.recipeId}?scale=${pr.scale}`}
                              className="font-bold hover:text-blue-400 transition-colors"
                              data-testid={`recipe-link-${pr.id}`}
                            >
                              {pr.recipe.title}
                            </Link>
                            <p
                              className="text-xs text-zinc-500"
                              data-testid={`recipe-scale-${pr.id}`}
                            >
                              Scale: {pr.scale}x
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/recipes/${pr.recipeId}/play?scale=${pr.scale}`}
                              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-bold transition-colors"
                            >
                              Cook it!
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    {meal.macros.calories > 0 && (
                      <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-4 text-[10px] text-zinc-500 font-mono">
                        <span>{Math.round(meal.macros.calories)} kcal</span>
                        <span>{Math.round(meal.macros.protein)}g P</span>
                        <span>{Math.round(meal.macros.fat)}g F</span>
                        <span>{Math.round(meal.macros.carbs)}g C</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Kitchen Status */}
        <div className="space-y-8 order-3 lg:order-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            Kitchen Status
          </h2>
          <DashboardClient immediatePrep={immediatePrep} />
        </div>
      </div>
    </div>
  );
}
