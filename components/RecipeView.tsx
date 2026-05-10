"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Recipe, Macros, RecipeStep, RecipeComponent } from "@/types";
interface RecipeViewProps {
  recipe: Recipe & {
    steps: RecipeStep[];
    components: RecipeComponent[];
  };
  macros: Macros;
  initialScale?: number;
}

export default function RecipeView({
  recipe,
  macros,
  initialScale = 1,
}: RecipeViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [scale, setScale] = useState(initialScale);
  const [showPerServing, setShowPerServing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (scale !== 1) {
      params.set("scale", scale.toString());
    } else {
      params.delete("scale");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [scale, router, pathname]);

  const scaledMacros =
    showPerServing && recipe.servings
      ? {
          calories: macros.calories / recipe.servings,
          protein: macros.protein / recipe.servings,
          fat: macros.fat / recipe.servings,
          carbs: macros.carbs / recipe.servings,
        }
      : {
          calories: macros.calories * scale,
          protein: macros.protein * scale,
          fat: macros.fat * scale,
          carbs: macros.carbs * scale,
        };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left Column: Nutrition & Ingredients */}
      <div className="lg:col-span-1 space-y-12">
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Nutrition Facts
            </h2>
            {recipe.servings && recipe.servings > 1 ? (
              <div className="flex bg-zinc-800 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setShowPerServing(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    !showPerServing
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Full Recipe
                </button>
                <button
                  onClick={() => setShowPerServing(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    showPerServing
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Per Serving
                </button>
              </div>
            ) : !recipe.servings ? (
              <p className="text-[10px] text-zinc-500 bg-zinc-800/30 p-2 rounded border border-zinc-800/50">
                Tip: Set a serving count in the editor to enable per-serving
                macros.
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 p-3 rounded-lg">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                Calories
              </p>
              <p className="text-2xl font-bold">
                {Math.round(scaledMacros.calories)}
              </p>
            </div>
            <div className="bg-zinc-800/50 p-3 rounded-lg">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                Protein
              </p>
              <p className="text-2xl font-bold">
                {Math.round(scaledMacros.protein)}g
              </p>
            </div>
            <div className="bg-zinc-800/50 p-3 rounded-lg">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                Fat
              </p>
              <p className="text-2xl font-bold">
                {Math.round(scaledMacros.fat)}g
              </p>
            </div>
            <div className="bg-zinc-800/50 p-3 rounded-lg">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                Carbs
              </p>
              <p className="text-2xl font-bold">
                {Math.round(scaledMacros.carbs)}g
              </p>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-zinc-600 leading-tight">
            * Nutrients are calculated based on ingredients and sub-recipes.
            Data provided by USDA.{" "}
            {showPerServing
              ? "Currently showing values per serving."
              : `Currently showing values for ${scale}x scale.`}
          </p>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-zinc-800">
            <h2 className="text-2xl font-bold">Ingredients</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="scale" className="text-sm text-zinc-500">
                Scale:
              </label>
              <input
                id="scale"
                type="number"
                step="0.1"
                min="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <ul className="space-y-4">
            {recipe.components.map((comp) => (
              <li key={comp.id} className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-zinc-200">
                    {comp.ingredient?.name || comp.childRecipe?.title}
                  </span>
                  <p className="text-sm text-zinc-500">
                    {(comp.quantity * scale).toFixed(1).replace(/\.0$/, "")}{" "}
                    {comp.unit}
                    {comp.prepState && `, ${comp.prepState}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Right Column: Instructions */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-zinc-800">
          Instructions
        </h2>
        <div className="space-y-8">
          {recipe.steps.map((step) => (
            <div key={step.id} className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold border border-zinc-700">
                {step.order}
              </div>
              <div>
                <p className="text-lg leading-relaxed">{step.instruction}</p>
                {step.timerInSeconds && (
                  <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {Math.floor(step.timerInSeconds / 60)} minutes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
