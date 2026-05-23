/**
 * FILE: app/meal-planner/PrepAheadDashboard.tsx
 * DESCRIPTION: Client component for aggregating upcoming ingredient preparation needs with premium dismissal workflow.
 * STANDARDS: TDD, Agentic Ergonomics.
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getPrepAheadDataAction,
  togglePrepCompletionAction,
  dismissPrepItemAction,
} from "./actions";

interface PrepAheadDashboardProps {
  startDate: string;
  endDate: string;
  initialData?: PrepItem[];
}

interface PrepItem {
  id: string;
  type: "ingredient" | "recipe";
  name: string;
  quantity: number;
  unit: string;
  prepState?: string;
  completed: boolean;
}

export default function PrepAheadDashboard({
  startDate,
  endDate,
  initialData,
}: PrepAheadDashboardProps) {
  const [data, setData] = useState<PrepItem[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isPending, startTransition] = useTransition();

  // Story 3 state: Dismissal confirmation workflow
  const [confirmDismissItem, setConfirmDismissItem] = useState<PrepItem | null>(
    null,
  );
  const [dontShowAgain, setDontShowAgain] = useState(false);
  // Read sessionStorage preference on initial render only (no SSR risk since this is a client component)
  const [skipWarning, setSkipWarning] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      sessionStorage.getItem("mise-en-place:skip-prep-dismiss-warning") ===
      "true"
    );
  });

  // Sync data when initialData prop changes (e.g. parent page revalidates)
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(initialData);

      setIsLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await getPrepAheadDataAction(
          new Date(startDate),
          new Date(endDate),
        );
        if (result.success) {
          setData(result.data);
        } else {
          console.error("Failed to fetch prep data:", result.error);
        }
      } catch (error) {
        console.error("Failed to fetch prep data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [startDate, endDate, initialData]);

  const handleToggle = (item: PrepItem) => {
    startTransition(async () => {
      const ingredientId = item.type === "ingredient" ? item.id : null;
      const childRecipeId = item.type === "recipe" ? item.id : null;
      await togglePrepCompletionAction(
        ingredientId,
        childRecipeId,
        !item.completed,
      );

      // Refresh data after toggle
      setIsLoading(true);
      try {
        const result = await getPrepAheadDataAction(
          new Date(startDate),
          new Date(endDate),
        );
        if (result.success) {
          setData(result.data);
        }
      } finally {
        setIsLoading(false);
      }
    });
  };

  const performDismiss = (item: PrepItem) => {
    startTransition(async () => {
      const ingredientId = item.type === "ingredient" ? item.id : null;
      const childRecipeId = item.type === "recipe" ? item.id : null;
      await dismissPrepItemAction(ingredientId, childRecipeId, true);

      // Refresh data after dismiss
      setIsLoading(true);
      try {
        const result = await getPrepAheadDataAction(
          new Date(startDate),
          new Date(endDate),
        );
        if (result.success) {
          setData(result.data);
        }
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleDismissClick = (item: PrepItem) => {
    if (skipWarning) {
      performDismiss(item);
    } else {
      setConfirmDismissItem(item);
      setDontShowAgain(false);
    }
  };

  const handleConfirmDismiss = () => {
    if (!confirmDismissItem) return;

    if (dontShowAgain && typeof window !== "undefined") {
      sessionStorage.setItem("mise-en-place:skip-prep-dismiss-warning", "true");
      setSkipWarning(true);
    }

    performDismiss(confirmDismissItem);
    setConfirmDismissItem(null);
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 animate-pulse h-48 flex items-center justify-center text-zinc-500">
        Calculating prep list...
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <svg
            className="w-5 h-5 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              data-testid="prep-icon-path"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Prep Ahead Aggregator
        </h2>
        <span className="text-xs text-zinc-500 font-medium bg-zinc-800 px-2 py-1 rounded">
          Next 7 Days
        </span>
      </div>

      {data.length === 0 ? (
        <p className="text-zinc-500 text-center py-8">
          No ingredients to prep for this period. Schedule some meals!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, i) => (
            <div
              key={i}
              className={`bg-zinc-800/30 p-3 rounded-lg border flex justify-between items-center transition-all group relative ${item.completed ? "border-green-900/50 opacity-60" : "border-zinc-800"}`}
              data-testid={`prep-item-${item.id}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggle(item)}
                  disabled={isPending}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
                />
                <div>
                  <p
                    className={`font-bold text-zinc-200 ${item.completed ? "line-through text-zinc-500" : ""}`}
                  >
                    {item.name}
                  </p>
                  {item.prepState && (
                    <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                      State: {item.prepState}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p
                    className={`text-lg font-mono font-bold ${item.completed ? "text-zinc-600" : "text-blue-400"}`}
                  >
                    {item.quantity.toFixed(1).replace(/\.0$/, "")}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase">
                    {item.unit}
                  </p>
                </div>
                <button
                  onClick={() => handleDismissClick(item)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 opacity-80 hover:opacity-100 transition-all ml-1 rounded-md hover:bg-zinc-800/50"
                  title="Dismiss from prep list"
                  data-testid={`dismiss-prep-${item.id}`}
                  disabled={isPending}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-zinc-600 italic mt-4">
        * Quantities are consolidated across all non-leftover meals in the
        selected range.
      </p>

      {/* Premium custom dismissal warning modal (Story 3 AC 2, 3, 4) */}
      {confirmDismissItem && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-in fade-in"
          data-testid="dismiss-modal-backdrop"
        >
          <div
            className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            data-testid="dismissal-dialog"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-4">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-zinc-100 text-center mb-2">
              Dismiss Prep Item?
            </h3>

            <p className="text-sm text-zinc-400 text-center mb-6">
              Are you sure you want to dismiss{" "}
              <span className="font-semibold text-zinc-200">
                &ldquo;{confirmDismissItem.name}&rdquo;
              </span>{" "}
              from your prep list?
            </p>

            <label className="flex items-center gap-3 bg-zinc-800/40 hover:bg-zinc-800/60 p-3 rounded-lg border border-zinc-800/50 cursor-pointer transition-colors mb-6 select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-red-500 focus:ring-red-500 focus:ring-offset-zinc-950"
                data-testid="dont-show-again-checkbox"
              />
              <span className="text-xs font-semibold text-zinc-300">
                Do not show this warning again during this session
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDismissItem(null)}
                className="flex-1 py-2 px-4 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-semibold border border-zinc-700 transition-colors"
                data-testid="cancel-dismiss-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDismiss}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-500/20 transition-all"
                data-testid="confirm-dismiss-btn"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
