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
  excludeFromPrep: boolean;
}

interface PlannedRecipeRowProps {
  pr: PlannedRecipeWithRecipe;
  onRemove: (id: string) => void;
  onToggleLeftoverSource: (id: string, isSource: boolean) => void;
  onUpdate: (
    id: string,
    updates: { scale?: number; prepState?: string; excludeFromPrep?: boolean },
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
            className="h-5 px-1 py-0 text-[10px] bg-zinc-800 border-zinc-600 text-zinc-200"
          />
          <span
            className="text-[10px] text-zinc-500"
            data-testid={`recipe-scale-${pr.id}`}
          >
            x
          </span>
        </div>

        <div className="flex-1">
          <Input
            value={pr.prepState || ""}
            onChange={(e) =>
              onUpdate(pr.id, {
                prepState: e.target.value,
              })
            }
            placeholder="Prep..."
            className="h-5 px-1 py-0 text-[10px] bg-zinc-800 border-zinc-600 text-zinc-200 w-full"
          />
        </div>

        <button
          onClick={() =>
            onUpdate(pr.id, { excludeFromPrep: !pr.excludeFromPrep })
          }
          className={`text-[9px] px-1 rounded border transition-colors h-5 flex items-center ${
            pr.excludeFromPrep
              ? "bg-zinc-600 border-zinc-500 text-zinc-400"
              : "border-blue-600/50 text-blue-400 hover:bg-blue-900/20"
          }`}
          title={pr.excludeFromPrep ? "Excluded from Prep" : "Include in Prep"}
        >
          {pr.excludeFromPrep ? "NP" : "P"}
        </button>
      </div>

      {!pr.isLeftoverSource && (
        <div className="flex items-center gap-1">
          <label className="text-[9px] text-zinc-500 whitespace-nowrap">
            Consume:
          </label>
          <Select
            value={pr.sourcePlannedRecipeId || ""}
            onChange={(e) => onLinkLeftover(pr.id, e.target.value || null)}
            className={`h-5 px-1 py-0 text-[9px] bg-zinc-800 text-zinc-200 w-full ${
              pr.sourcePlannedRecipeId ? "border-green-500" : "border-zinc-600"
            }`}
          >
            <option value="">None</option>
            {sourceOptions.map((source) => (
              <option key={source.id} value={source.id}>
                {new Date(source.date).toLocaleDateString(undefined, {
                  weekday: "short",
                })}
              </option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
}
