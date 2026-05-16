/**
 * @file MealCalendarClient.tsx
 * @responsibility The main client-side component for the meal calendar, managing state and layout.
 * @dependencies MealSlot, AddMealModal, AddRecipeModal, CloneMealModal, actions, useRouter, usePathname, useSearchParams, React, Link
 */

"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MealSlot from "@/components/MealSlot";
import AddMealModal from "@/components/AddMealModal";
import AddRecipeModal from "@/components/AddRecipeModal";
import CloneMealModal from "@/components/CloneMealModal";
import {
  createMealAction,
  addRecipeToMealAction,
  deleteMealAction,
  removeRecipeFromMealAction,
  updatePlannedRecipeAction,
  setLeftoverSourceAction,
  linkLeftoverConsumptionAction,
  cloneMealAction,
  reorderMealAction,
} from "@/app/meal-planner/actions";
import { Meal, Recipe } from "@/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface MealCalendarClientProps {
  initialMeals: (Meal & {
    macros: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    plannedRecipes: (PlannedRecipe & { recipe: Recipe })[];
  })[];
  startDate: string;
  allRecipes: Pick<Recipe, "id" | "title">[];
}

export default function MealCalendarClient({
  initialMeals,
  startDate: start,
  allRecipes,
}: MealCalendarClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAddingMeal, setIsAddingMeal] = useState<{ date: Date } | null>(null);
  const [isAddingRecipe, setIsAddingRecipe] = useState<{
    mealId: string;
  } | null>(null);
  const [isCloningMeal, setIsCloningMeal] = useState<{ mealId: string } | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getMealsForDate = (date: Date) => {
    return initialMeals.filter(
      (m) => new Date(m.date).toDateString() === date.toDateString(),
    );
  };

  const getDailyMacros = (date: Date) => {
    const meals = getMealsForDate(date);
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.macros.calories,
        protein: acc.protein + m.macros.protein,
        fat: acc.fat + m.macros.fat,
        carbs: acc.carbs + m.macros.carbs,
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
    if (confirm("Are you sure you want to delete this meal?")) {
      await deleteMealAction(mealId);
    }
  };

  const handleRemoveRecipe = async (plannedRecipeId: string) => {
    await removeRecipeFromMealAction(plannedRecipeId);
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

  const handleUpdatePlannedRecipe = async (
    id: string,
    updates: { scale?: number; prepState?: string; excludeFromPrep?: boolean },
  ) => {
    const res = await updatePlannedRecipeAction(id, updates);
    if (!res.success) {
      alert(res.error || "Failed to update recipe");
    }
  };

  const handleDragEnd = async (event: DragEndEvent, date: Date) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const meals = getMealsForDate(date);
      const oldIndex = meals.findIndex((m) => m.id === active.id);
      const newIndex = meals.findIndex((m) => m.id === over.id);

      const newMeals = arrayMove(meals, oldIndex, newIndex);

      // Simple implementation: Update sortOrder for all moved meals
      // In a real app, you might only update the moved one or do a batch update
      for (let i = 0; i < newMeals.length; i++) {
        await reorderMealAction(newMeals[i].id, i);
      }
    }
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day, i) => {
          const dailyMacros = getDailyMacros(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const meals = getMealsForDate(day);

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
                  <p className="text-lg font-bold">
                    {day.toLocaleDateString(undefined, { day: "numeric" })}
                  </p>
                </div>
                {dailyMacros.calories > 0 && (
                  <div className="text-right text-[10px] space-y-0.5 font-mono text-zinc-400">
                    <p>{Math.round(dailyMacros.calories)} kcal</p>
                    <p>
                      {Math.round(dailyMacros.protein)}P |{" "}
                      {Math.round(dailyMacros.fat)}F |{" "}
                      {Math.round(dailyMacros.carbs)}C
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 p-2 space-y-3">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, day)}
                >
                  <SortableContext
                    items={meals.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {meals.map((meal) => (
                      <MealSlot
                        key={meal.id}
                        meal={meal}
                        onDeleteMeal={handleDeleteMeal}
                        onCloneMeal={(mealId) => setIsCloningMeal({ mealId })}
                        onAddRecipe={(mealId) => setIsAddingRecipe({ mealId })}
                        onRemoveRecipe={handleRemoveRecipe}
                        onToggleLeftoverSource={handleToggleLeftoverSource}
                        onUpdatePlannedRecipe={handleUpdatePlannedRecipe}
                        onLinkLeftover={handleLinkLeftover}
                        leftoverSourceOptions={leftoverSourceOptions}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

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
