/**
 * @file PlannedRecipeRow.tsx
 * @responsibility Manages the display of a single planned recipe, including its scale, prep state, and leftover toggles.
 * @dependencies Link, Input, Select, React
 */

import React from "react";
import Link from "next/link";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

export interface PlannedRecipeWithRecipe {
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

interface PlannedRecipeRowProps {
  pr: PlannedRecipeWithRecipe;
  onRemove: (id: string) => void;
  onToggleLeftoverSource: (id: string, isSource: boolean) => void;
  onUpdate: (
    id: string,
    updates: { scale?: number; prepState?: string },
  ) => void;
  onLinkLeftover: (id: string, sourceId: string | null) => void;
  sourceOptions: { id: string; date: string | Date }[];
}

export default function PlannedRecipeRow({
  pr,
  onRemove,
  onToggleLeftoverSource,
  onUpdate,
  onLinkLeftover,
  sourceOptions,
}: PlannedRecipeRowProps) {
  return (
    <div
      className={`flex flex-col gap-1 p-1 rounded group border ${
        pr.isLeftoverSource
          ? "border-amber-500/50 bg-amber-500/5"
          : pr.sourcePlannedRecipeId
            ? "border-green-500/50 bg-green-500/5 opacity-80"
            : "bg-zinc-700/30 border-transparent"
      }`}
      data-testid={`planned-recipe-${pr.id}`}
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
          onClick={() => onRemove(pr.id)}
          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 text-lg leading-none"
          title="Remove Recipe"
        >
          &times;
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={() => onToggleLeftoverSource(pr.id, !pr.isLeftoverSource)}
          className={`text-[9px] px-1 rounded border transition-colors h-5 flex items-center ${
            pr.isLeftoverSource
              ? "bg-amber-600 border-amber-500 text-white"
              : "border-zinc-600 text-zinc-500 hover:border-amber-500"
          }`}
          title={
            pr.isLeftoverSource
              ? "Produces Leftovers"
              : "Mark as Leftover Source"
          }
        >
          LS
        </button>

        <div className="flex items-center gap-1 w-10">
          <Input
            type="number"
            step="0.5"
            min="0.5"
            value={pr.scale}
            data-testid={`scale-input-${pr.id}`}
            onChange={(e) =>
              onUpdate(pr.id, {
                scale: parseFloat(e.target.value) || 1.0,
              })
            }
            className="p-1 h-5 text-[9px] text-center"
          />
        </div>

        <div className="flex-1 min-w-0">
          <Input
            type="text"
            value={pr.prepState || ""}
            placeholder="Prep override..."
            onChange={(e) =>
              onUpdate(pr.id, {
                prepState: e.target.value,
              })
            }
            className="p-1 h-5 text-[9px]"
          />
        </div>

        {!pr.isLeftoverSource && (
          <div className="w-16">
            <Select
              className={`p-0 h-5 text-[9px] ${
                pr.sourcePlannedRecipeId
                  ? "border-green-500 text-green-400"
                  : "border-zinc-600 text-zinc-500"
              }`}
              value={pr.sourcePlannedRecipeId || ""}
              onChange={(e) => onLinkLeftover(pr.id, e.target.value || null)}
            >
              <option value="">Fresh</option>
              {sourceOptions.map((source) => (
                <option key={source.id} value={source.id}>
                  From{" "}
                  {new Date(source.date).toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
