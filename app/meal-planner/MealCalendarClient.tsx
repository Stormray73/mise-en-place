"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  createMealAction,
  addRecipeToMealAction,
  deleteMealAction,
  removeRecipeFromMealAction,
  setLeftoverSourceAction,
  linkLeftoverConsumptionAction,
  updatePlannedRecipeAction,
  cloneMealAction,
} from "./actions";

interface RecipeOption {
  id: string;
  title: string;
}

interface PlannedRecipeWithRecipe {
  id: string;
  recipeId: string;
  recipe: {
    title: string;
  };
  scale: number;
  prepState?: string | null;
  isLeftoverSource: boolean;
  sourcePlannedRecipeId?: string | null;
}

interface MealWithRecipes {
  id: string;
  date: string | Date;
  slot: string;
  plannedRecipes: PlannedRecipeWithRecipe[];
  macros: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

interface MealCalendarClientProps {
  initialMeals: MealWithRecipes[];
  startDate: string;
  allRecipes: RecipeOption[];
}

const DEFAULT_SLOTS = ["Breakfast", "Lunch", "Dinner"];

export default function MealCalendarClient({
  initialMeals,
  startDate,
  allRecipes,
}: MealCalendarClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const start = new Date(startDate);

  const [isAddingMeal, setIsAddingMeal] = useState<{ date: Date } | null>(null);
  const [isAddingRecipe, setIsAddingRecipe] = useState<{
    mealId: string;
  } | null>(null);
  const [isCloningMeal, setIsCloningMeal] = useState<{ mealId: string } | null>(
    null,
  );
  const [customSlot, setCustomSlot] = useState("");

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return date;
  });

  const getMealsForDate = (date: Date) => {
    return initialMeals.filter(
      (m) => new Date(m.date).toDateString() === date.toDateString(),
    );
  };

  const getDailyMacros = (date: Date) => {
    const meals = getMealsForDate(date);
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.macros.calories,
        protein: acc.protein + meal.macros.protein,
        fat: acc.fat + meal.macros.fat,
        carbs: acc.carbs + meal.macros.carbs,
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0 },
    );
  };

  const handleAddMeal = async (date: Date, slot: string) => {
    await createMealAction(date, slot);
    setIsAddingMeal(null);
    setCustomSlot("");
  };

  const handleAddRecipe = async (mealId: string, recipeId: string) => {
    await addRecipeToMealAction(mealId, recipeId);
    setIsAddingRecipe(null);
  };

  const handleCloneMeal = async (mealId: string, targetDate: Date) => {
    await cloneMealAction(mealId, targetDate);
    setIsCloningMeal(null);
  };

  const handleToggleLeftoverSource = async (
    plannedRecipeId: string,
    isSource: boolean,
  ) => {
    await setLeftoverSourceAction(plannedRecipeId, isSource);
  };

  const handleLinkLeftover = async (
    plannedRecipeId: string,
    sourceId: string | null,
  ) => {
    await linkLeftoverConsumptionAction(plannedRecipeId, sourceId);
  };

  const navigateWeek = (weeks: number) => {
    const newDate = new Date(start);
    newDate.setDate(newDate.getDate() + weeks * 7);
    router.push(`${pathname}?date=${newDate.toISOString().split("T")[0]}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <div className="flex gap-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded"
          >
            &larr; Prev Week
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded"
          >
            Next Week &rarr;
          </button>
        </div>
        <h2 className="text-xl font-bold">
          {start.toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
          })}{" "}
          -{" "}
          {days[6].toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() => router.push(pathname)}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-400"
        >
          Current Week
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day, i) => {
          const dailyMacros = getDailyMacros(day);
          return (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col min-h-[400px]"
            >
              <div className="p-3 border-b border-zinc-800 bg-zinc-950/50 rounded-t-lg flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    {day.toLocaleDateString(undefined, { weekday: "short" })}
                  </p>
                  <p className="text-lg font-bold">{day.getDate()}</p>
                </div>
                {dailyMacros.calories > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-blue-500 uppercase">
                      Daily
                    </p>
                    <p className="text-xs font-mono font-bold text-zinc-300">
                      {Math.round(dailyMacros.calories)}{" "}
                      <span className="text-[8px] text-zinc-600 font-normal">
                        kcal
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 p-2 space-y-3">
                {getMealsForDate(day).map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-zinc-800/50 rounded p-2 border border-zinc-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 uppercase">
                          {meal.slot}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {Math.round(meal.macros.calories)} kcal
                        </span>
                        <button
                          onClick={() => setIsCloningMeal({ mealId: meal.id })}
                          className="text-[9px] text-zinc-600 hover:text-zinc-400 uppercase font-bold"
                          title="Duplicate Meal"
                        >
                          Clone
                        </button>
                      </div>
                      <button
                        onClick={() => deleteMealAction(meal.id)}
                        className="text-zinc-500 hover:text-red-500"
                      >
                        &times;
                      </button>
                    </div>

                    <div className="space-y-1">
                      {meal.plannedRecipes.map((pr) => (
                        <div
                          key={pr.id}
                          className={`flex flex-col gap-1 p-1 rounded group border ${pr.isLeftoverSource ? "border-amber-500/50 bg-amber-500/5" : pr.sourcePlannedRecipeId ? "border-green-500/50 bg-green-500/5 opacity-80" : "bg-zinc-700/30 border-transparent"}`}
                        >
                          <div className="flex justify-between items-center text-sm">
                            <Link
                              href={`/recipes/${pr.recipeId}?scale=${pr.scale}`}
                              className="truncate hover:text-blue-400 transition-colors"
                              title={pr.recipe.title}
                            >
                              {pr.recipe.title}
                            </Link>
                            <button
                              onClick={() => removeRecipeFromMealAction(pr.id)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500"
                            >
                              &times;
                            </button>
                          </div>

                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() =>
                                handleToggleLeftoverSource(
                                  pr.id,
                                  !pr.isLeftoverSource,
                                )
                              }
                              className={`text-[9px] px-1 rounded border transition-colors ${pr.isLeftoverSource ? "bg-amber-600 border-amber-500 text-white" : "border-zinc-600 text-zinc-500 hover:border-amber-500"}`}
                              title={
                                pr.isLeftoverSource
                                  ? "Produces Leftovers"
                                  : "Mark as Leftover Source"
                              }
                            >
                              LS
                            </button>

                            <div className="flex items-center gap-1">
                              <span className="text-[8px] text-zinc-600">
                                x
                              </span>
                              <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={pr.scale}
                                onChange={(e) =>
                                  updatePlannedRecipeAction(pr.id, {
                                    scale: parseFloat(e.target.value) || 1.0,
                                  })
                                }
                                className="bg-transparent border-b border-zinc-700 text-[9px] w-6 outline-none text-zinc-400 focus:border-blue-500"
                              />
                            </div>

                            <input
                              type="text"
                              value={pr.prepState || ""}
                              placeholder="Prep override..."
                              onChange={(e) =>
                                updatePlannedRecipeAction(pr.id, {
                                  prepState: e.target.value,
                                })
                              }
                              className="bg-transparent border-b border-zinc-700 text-[9px] flex-1 outline-none text-zinc-400 focus:border-blue-500 min-w-0"
                            />

                            {!pr.isLeftoverSource && (
                              <select
                                className={`text-[9px] bg-transparent border rounded outline-none max-w-[60px] ${pr.sourcePlannedRecipeId ? "border-green-500 text-green-400" : "border-zinc-600 text-zinc-500"}`}
                                value={pr.sourcePlannedRecipeId || ""}
                                onChange={(e) =>
                                  handleLinkLeftover(
                                    pr.id,
                                    e.target.value || null,
                                  )
                                }
                              >
                                <option value="">Fresh</option>
                                {initialMeals
                                  .flatMap((m) => m.plannedRecipes)
                                  .filter(
                                    (otherPr) =>
                                      otherPr.isLeftoverSource &&
                                      otherPr.id !== pr.id,
                                  )
                                  .map((source) => {
                                    const sourceMeal = initialMeals.find((m) =>
                                      m.plannedRecipes.some(
                                        (p) => p.id === source.id,
                                      ),
                                    );
                                    return sourceMeal ? (
                                      <option key={source.id} value={source.id}>
                                        From{" "}
                                        {new Date(
                                          sourceMeal.date,
                                        ).toLocaleDateString(undefined, {
                                          weekday: "short",
                                        })}
                                      </option>
                                    ) : null;
                                  })}
                              </select>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setIsAddingRecipe({ mealId: meal.id })}
                        className="w-full text-left text-[10px] text-zinc-500 hover:text-zinc-300 py-1"
                      >
                        + Add Recipe
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setIsAddingMeal({ date: day })}
                  className="w-full py-2 border border-dashed border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400 rounded-md text-sm transition-all"
                >
                  + Add Meal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Meal Modal */}
      {isAddingMeal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add Meal Slot</h3>
            <p className="text-zinc-400 text-sm mb-6">
              {isAddingMeal.date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {DEFAULT_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleAddMeal(isAddingMeal.date, slot)}
                  className="py-3 bg-zinc-800 hover:bg-blue-600 rounded-md font-bold transition-colors"
                >
                  {slot}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customSlot}
                onChange={(e) => setCustomSlot(e.target.value)}
                placeholder="Custom Slot..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2"
              />
              <button
                onClick={() => handleAddMeal(isAddingMeal.date, customSlot)}
                disabled={!customSlot}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <button
              onClick={() => setIsAddingMeal(null)}
              className="mt-6 w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {isAddingRecipe && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-xl font-bold mb-4">Add Recipe to Meal</h3>
            <div className="flex-1 overflow-y-auto space-y-2 mb-6">
              {allRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() =>
                    handleAddRecipe(isAddingRecipe.mealId, recipe.id)
                  }
                  className="w-full text-left p-3 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
                >
                  {recipe.title}
                </button>
              ))}
              {allRecipes.length === 0 && (
                <p className="text-zinc-500 text-center py-4">
                  No recipes found.
                </p>
              )}
            </div>
            <button
              onClick={() => setIsAddingRecipe(null)}
              className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Clone Meal Modal */}
      {isCloningMeal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Clone Meal to Date</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {days.map((day) => (
                <button
                  key={day.toISOString()}
                  onClick={() => handleCloneMeal(isCloningMeal.mealId, day)}
                  className="py-3 bg-zinc-800 hover:bg-blue-600 rounded-md text-xs font-bold transition-colors"
                >
                  {day.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsCloningMeal(null)}
              className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
