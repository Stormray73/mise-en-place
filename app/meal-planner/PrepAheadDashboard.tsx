/**
 * FILE: app/meal-planner/PrepAheadDashboard.tsx
 * DESCRIPTION: Client component for aggregating upcoming ingredient preparation needs.
 * STANDARDS: TDD, Agentic Ergonomics.
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getPrepAheadDataAction,
  togglePrepCompletionAction,
  dismissPrepItemAction,
} from "./actions";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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

  const [showDismissModal, setShowDismissModal] = useState(false);
  const [itemToDismiss, setItemToDismiss] = useState<PrepItem | null>(null);
  const [dontShowWarningAgain, setDontShowWarningAgain] = useState(false);
  const [suppressWarning, setSuppressWarning] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("suppress-prep-dismiss-warning");
      if (stored === "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSuppressWarning(true);
      }
    }
  }, []);

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

  const performDismiss = async (item: PrepItem) => {
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

  const handleDismiss = (item: PrepItem) => {
    if (suppressWarning) {
      performDismiss(item);
    } else {
      setItemToDismiss(item);
      setShowDismissModal(true);
    }
  };

  const confirmDismissal = () => {
    if (itemToDismiss) {
      if (dontShowWarningAgain) {
        sessionStorage.setItem("suppress-prep-dismiss-warning", "true");
        setSuppressWarning(true);
      }
      performDismiss(itemToDismiss);
    }
    setShowDismissModal(false);
    setItemToDismiss(null);
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
                  onClick={() => handleDismiss(item)}
                  className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                  title="Dismiss from prep list"
                  disabled={isPending}
                >
                  <svg
                    className="w-4.5 h-4.5"
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

      {showDismissModal && itemToDismiss && (
        <Modal
          title="Confirm Dismissal"
          onClose={() => {
            setShowDismissModal(false);
            setItemToDismiss(null);
          }}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-zinc-300 text-left">
              Are you sure you want to dismiss{" "}
              <span className="font-bold text-zinc-100">
                &ldquo;{itemToDismiss.name}&rdquo;
              </span>{" "}
              from your prep list? This will remove the item from this view.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="dont-show-warning-again"
                checked={dontShowWarningAgain}
                onChange={(e) => setDontShowWarningAgain(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-750 bg-zinc-950 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label
                htmlFor="dont-show-warning-again"
                className="text-xs text-zinc-400 cursor-pointer select-none font-medium"
              >
                Do not show this warning again during this session
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowDismissModal(false);
                  setItemToDismiss(null);
                }}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={confirmDismissal}
                className="text-xs px-4 py-2 font-bold"
              >
                Dismiss Item
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
