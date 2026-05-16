/**
 * @file DashboardClient.tsx
 * @responsibility Main client-side component for the user dashboard, displaying timers and prep items.
 * @dependencies React, Link, Card, types
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrepItem } from "@/types";
import { updatePlannedRecipeAction } from "@/app/meal-planner/actions";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface ActiveTimer {
  recipeId: string;
  recipeTitle?: string;
  stepId: string;
  endTime: number;
  remaining: number;
}

export default function DashboardClient({
  immediatePrep,
}: {
  immediatePrep: PrepItem[];
}) {
  const router = useRouter();
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);

  useEffect(() => {
    const updateTimers = () => {
      const timers: ActiveTimer[] = [];
      const now = Date.now();

      // Scan localStorage for timers_* keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("timers_")) {
          const recipeId = key.replace("timers_", "");
          try {
            const saved = JSON.parse(localStorage.getItem(key) || "{}");
            Object.entries(saved).forEach(([stepId, endTime]) => {
              const remaining = Math.max(
                0,
                Math.floor((Number(endTime) - now) / 1000),
              );
              if (remaining > 0 || Number(endTime) > now - 60000) {
                // Keep for 1 min after done
                timers.push({
                  recipeId,
                  stepId,
                  endTime: Number(endTime),
                  remaining,
                });
              }
            });
          } catch (e) {
            console.error("Error parsing timers from localStorage", e);
          }
        }
      }

      setActiveTimers(timers.sort((a, b) => a.endTime - b.endTime));
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExclude = async (plannedRecipeId: string) => {
    const res = await updatePlannedRecipeAction(plannedRecipeId, {
      excludeFromPrep: true,
    });
    if (res.success) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Timers Card */}
      {activeTimers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Timers</CardTitle>
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTimers.map((timer) => (
              <div
                key={`${timer.recipeId}-${timer.stepId}`}
                className={`p-3 rounded-lg border ${
                  timer.remaining === 0
                    ? "bg-red-900/20 border-red-900 animate-bounce"
                    : "bg-blue-900/20 border-blue-900"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-400">Timer</span>
                  {timer.remaining === 0 && (
                    <span className="text-[10px] font-bold text-red-500 uppercase">
                      Finished
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-2xl font-mono font-bold">
                    {formatTime(timer.remaining)}
                  </div>
                  <Link
                    href={`/recipes/${timer.recipeId}/play`}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    View Recipe →
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Immediate Prep Card */}
      <Card data-testid="immediate-prep-section">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <CardTitle>Immediate Prep</CardTitle>
            <Link
              href="/dashboard/shopping-list"
              className="text-xs text-blue-400 hover:underline"
            >
              Go to Shopping List &rarr;
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {immediatePrep.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">All caught up!</p>
          ) : (
            <ul className="space-y-3">
              {immediatePrep.map((item, i) => (
                <li key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {item.name}
                      </p>
                      {item.prepState && (
                        <p className="text-[10px] text-zinc-500 uppercase">
                          {item.prepState}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-zinc-400">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    {item.type === "recipe" && (
                      <button
                        onClick={() => handleExclude(item.id)}
                        className="text-[10px] font-bold text-zinc-600 hover:text-red-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hide from prep list"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <Link
              href="/meal-planner"
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              See full prep list →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
