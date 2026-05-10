"use client";

import { useState, useEffect, useRef } from "react";
import { getRelevantIngredients } from "@/lib/ingredient-matcher";
import { useRouter } from "next/navigation";
import { Recipe, RecipeStep, RecipeComponent } from "@/types";

interface RecipePlayModeProps {
  recipe: Recipe & { steps: RecipeStep[]; components: RecipeComponent[] };
  scale?: number;
}

export function RecipePlayMode({ recipe, scale = 1 }: RecipePlayModeProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Initialize state from localStorage to avoid setState in useEffect
  const [activeTimers, setActiveTimers] = useState<{ [key: string]: number }>(
    () => {
      if (typeof window === "undefined") return {};
      const saved = localStorage.getItem(`timers_${recipe.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const rehydrated: { [key: string]: number } = {};
        Object.entries(parsed).forEach(([stepId, endTime]) => {
          const remaining = Math.max(
            0,
            Math.floor((Number(endTime) - now) / 1000),
          );
          rehydrated[stepId] = remaining;
        });
        return rehydrated;
      }
      return {};
    },
  );

  const timerIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const steps = recipe.steps || [];
  const currentStep = steps[currentStepIndex];

  const relevantIngredients = currentStep
    ? getRelevantIngredients(currentStep.instruction, recipe.components)
    : recipe.components;

  const startInterval = (stepId: string, endTime: number) => {
    if (timerIntervals.current[stepId])
      clearInterval(timerIntervals.current[stepId]);

    timerIntervals.current[stepId] = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

      setActiveTimers((prev) => ({ ...prev, [stepId]: remaining }));

      if (remaining <= 0) {
        clearInterval(timerIntervals.current[stepId]);
        delete timerIntervals.current[stepId];
      }
    }, 1000);
  };

  const startTimer = (stepId: string, duration: number) => {
    if (timerIntervals.current[stepId]) return;

    const endTime = Date.now() + duration * 1000;
    const currentSaved = JSON.parse(
      localStorage.getItem(`timers_${recipe.id}`) || "{}",
    );
    localStorage.setItem(
      `timers_${recipe.id}`,
      JSON.stringify({ ...currentSaved, [stepId]: endTime }),
    );

    setActiveTimers((prev) => ({ ...prev, [stepId]: duration }));
    startInterval(stepId, endTime);
  };

  const dismissTimer = (stepId: string) => {
    setActiveTimers((prev) => {
      const next = { ...prev };
      delete next[stepId];
      return next;
    });

    const currentSaved = JSON.parse(
      localStorage.getItem(`timers_${recipe.id}`) || "{}",
    );
    delete currentSaved[stepId];
    localStorage.setItem(`timers_${recipe.id}`, JSON.stringify(currentSaved));

    if (timerIntervals.current[stepId]) {
      clearInterval(timerIntervals.current[stepId]);
      delete timerIntervals.current[stepId];
    }
  };

  const clearAllTimers = () => {
    setActiveTimers({});
    localStorage.removeItem(`timers_${recipe.id}`);
    Object.values(timerIntervals.current).forEach(clearInterval);
    timerIntervals.current = {};
  };

  useEffect(() => {
    // Start intervals for rehydrated timers
    const saved = localStorage.getItem(`timers_${recipe.id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      const now = Date.now();
      Object.entries(parsed).forEach(([stepId, endTime]) => {
        const remaining = Math.max(
          0,
          Math.floor((Number(endTime) - now) / 1000),
        );
        if (remaining > 0) {
          startInterval(stepId, Number(endTime));
        }
      });
    }

    return () => {
      Object.values(timerIntervals.current).forEach(clearInterval);
    };
  }, [recipe.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Sidebar: Ingredients & Active Timers */}
      <div className="md:col-span-1 space-y-8">
        <section className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
          <h2 className="text-lg font-semibold mb-4 border-b border-zinc-800 pb-2">
            {relevantIngredients.length === recipe.components?.length
              ? "All Ingredients"
              : "Step Ingredients"}
          </h2>
          <ul className="space-y-2 text-zinc-300">
            {relevantIngredients.length > 0
              ? relevantIngredients.map((c, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm animate-in fade-in duration-500"
                  >
                    <span>
                      {c.ingredient?.name ||
                        c.childRecipe?.title ||
                        "Sub-recipe"}
                    </span>
                    <span className="text-zinc-500">
                      {(c.quantity * scale).toFixed(1).replace(/\.0$/, "")}{" "}
                      {c.unit}
                    </span>
                  </li>
                ))
              : recipe.components?.map((c, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm opacity-50"
                  >
                    <span>
                      {c.ingredient?.name ||
                        c.childRecipe?.title ||
                        "Sub-recipe"}
                    </span>
                    <span className="text-zinc-500">
                      {(c.quantity * scale).toFixed(1).replace(/\.0$/, "")}{" "}
                      {c.unit}
                    </span>
                  </li>
                ))}
          </ul>
        </section>

        {Object.keys(activeTimers).length > 0 && (
          <section className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
              <h2 className="text-lg font-semibold">Active Timers</h2>
              <button
                onClick={clearAllTimers}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(activeTimers).map(([stepId, remaining]) => {
                const step = steps.find((s) => s.id === stepId);
                return (
                  <div
                    key={stepId}
                    className={`p-3 rounded-md border group relative ${remaining === 0 ? "bg-red-900/20 border-red-900" : "bg-blue-900/20 border-blue-900"}`}
                  >
                    <button
                      onClick={() => dismissTimer(stepId)}
                      className="absolute top-2 right-2 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="text-xs text-zinc-400 mb-1">
                      Step {step?.order}
                    </div>
                    <div className="text-2xl font-mono font-bold flex justify-between items-center">
                      {formatTime(remaining)}
                      {remaining === 0 && (
                        <span className="text-xs uppercase tracking-widest text-red-500 animate-pulse">
                          Done
                        </span>
                      )}
                    </div>
                    {remaining === 0 && (
                      <button
                        onClick={() => dismissTimer(stepId)}
                        className="mt-2 w-full py-1 bg-red-900/40 hover:bg-red-900/60 rounded text-xs font-bold transition-colors"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Main: Stepper */}
      <div className="md:col-span-2 space-y-6">
        {currentStep ? (
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-2xl min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4 items-center">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  Step {currentStep.order} of {steps.length}
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Exit Mode
                </button>
              </div>
              {currentStep.timerInSeconds && (
                <button
                  type="button"
                  onClick={() =>
                    startTimer(
                      currentStep.id,
                      currentStep.timerInSeconds as number,
                    )
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
                    activeTimers[currentStep.id] !== undefined
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                  disabled={activeTimers[currentStep.id] !== undefined}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {activeTimers[currentStep.id] !== undefined
                    ? "Timer Active"
                    : `Start ${formatTime(currentStep.timerInSeconds)} Timer`}
                </button>
              )}
            </div>

            <p className="text-2xl leading-relaxed text-zinc-100 flex-1">
              {currentStep.instruction}
            </p>

            <div className="flex justify-between mt-8 pt-6 border-t border-zinc-800">
              <button
                type="button"
                onClick={() =>
                  setCurrentStepIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentStepIndex === 0}
                className="px-6 py-2 rounded-md font-semibold disabled:opacity-30 hover:bg-zinc-800 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentStepIndex < steps.length - 1) {
                    setCurrentStepIndex((prev) => prev + 1);
                  } else {
                    clearAllTimers();
                    router.push(`/recipes/${recipe.id}`);
                  }
                }}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-bold transition-colors"
              >
                {currentStepIndex === steps.length - 1 ? "Finish" : "Next Step"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-500">
              Bon Appétit!
            </h2>
            <p className="text-zinc-400">
              You&apos;ve completed all steps for this recipe.
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
