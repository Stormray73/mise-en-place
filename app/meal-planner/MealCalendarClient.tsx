/**
 * @file MealCalendarClient.tsx
 * @responsibility The main client-side component for the meal calendar, managing state and layout.
 * @dependencies MealSlot, AddMealModal, AddRecipeModal, CloneMealModal, actions, useRouter, usePathname, React
 */

"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import MealSlot, { MealWithRecipes } from "@/components/MealSlot";
import AddMealModal from "@/components/AddMealModal";
import AddRecipeModal from "@/components/AddRecipeModal";
import CloneMealModal from "@/components/CloneMealModal";

interface RecipeOption {
  id: string;
  title: string;
}

interface MealCalendarClientProps {
  initialMeals: MealWithRecipes[];
  startDate: string;
  allRecipes: RecipeOption[];
}

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
    const res = await createMealAction(date, slot);
    if (!res.success) {
      alert(res.error);
    }
    setIsAddingMeal(null);
  };

  const handleAddRecipe = async (mealId: string, recipeId: string) => {
    await addRecipeToMealAction(mealId, recipeId);
    setIsAddingRecipe(null);
  };

  const handleDeleteMeal = async (mealId: string) => {
    await deleteMealAction(mealId);
  };

  const handleRemoveRecipe = async (id: string) => {
    await removeRecipeFromMealAction(id);
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

  const leftoverSourceOptions = initialMeals
    .flatMap((m) => m.plannedRecipes)
    .filter((pr) => pr.isLeftoverSource)
    .map((pr) => {
      const meal = initialMeals.find((m) =>
        m.plannedRecipes.some((p) => p.id === pr.id),
      );
      return { id: pr.id, date: meal?.date || "" };
    });

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
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div
              key={i}
              data-testid={isToday ? "day-today" : undefined}
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
                  <MealSlot
                    key={meal.id}
                    meal={meal}
                    onDeleteMeal={handleDeleteMeal}
                    onCloneMeal={(mealId) => setIsCloningMeal({ mealId })}
                    onAddRecipe={(mealId) => setIsAddingRecipe({ mealId })}
                    onRemoveRecipe={handleRemoveRecipe}
                    onToggleLeftoverSource={handleToggleLeftoverSource}
                    onUpdatePlannedRecipe={updatePlannedRecipeAction}
                    onLinkLeftover={handleLinkLeftover}
                    leftoverSourceOptions={leftoverSourceOptions}
                  />
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

      {isAddingMeal && (
        <AddMealModal
          date={isAddingMeal.date}
          onClose={() => setIsAddingMeal(null)}
          onAdd={handleAddMeal}
        />
      )}

      {isAddingRecipe && (
        <AddRecipeModal
          mealId={isAddingRecipe.mealId}
          allRecipes={allRecipes}
          onClose={() => setIsAddingRecipe(null)}
          onAdd={handleAddRecipe}
        />
      )}

      {isCloningMeal && (
        <CloneMealModal
          mealId={isCloningMeal.mealId}
          days={days}
          onClose={() => setIsCloningMeal(null)}
          onClone={handleCloneMeal}
        />
      )}
    </div>
  );
}
