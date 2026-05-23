import React from "react";
import Modal from "./ui/Modal";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { PlannedRecipeWithRecipe } from "./PlannedRecipeRow";

interface EditMealModalProps {
  meal: {
    id: string;
    slot: string;
    plannedRecipes: PlannedRecipeWithRecipe[];
  };
  onClose: () => void;
  onAddRecipe: (mealId: string) => void;
  onDeleteMeal: (mealId: string) => void;
  onRemoveRecipe: (plannedRecipeId: string) => void;
  onToggleLeftoverSource: (plannedRecipeId: string, isSource: boolean) => void;
  onUpdatePlannedRecipe: (
    id: string,
    updates: { scale?: number; prepState?: string; excludeFromPrep?: boolean },
  ) => void;
  onLinkLeftover: (id: string, sourceId: string | null) => void;
  leftoverSourceOptions: { id: string; date: string | Date }[];
}

export default function EditMealModal({
  meal,
  onClose,
  onAddRecipe,
  onDeleteMeal,
  onRemoveRecipe,
  onToggleLeftoverSource,
  onUpdatePlannedRecipe,
  onLinkLeftover,
  leftoverSourceOptions,
}: EditMealModalProps) {
  const handleDeleteMeal = () => {
    if (confirm("Are you sure you want to delete this meal and all its planned recipes?")) {
      onDeleteMeal(meal.id);
      onClose();
    }
  };

  const handleAddRecipeClick = () => {
    onAddRecipe(meal.id);
    onClose();
  };

  return (
    <Modal title={`Edit Meal: ${meal.slot}`} onClose={onClose}>
      <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-5">
        {meal.plannedRecipes.map((pr) => (
          <div
            key={pr.id}
            className={`p-4 rounded-lg border bg-zinc-900/80 space-y-4 ${
              pr.isLeftoverSource
                ? "border-amber-500/50"
                : pr.sourcePlannedRecipeId
                  ? "border-green-500/50"
                  : "border-zinc-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-100 text-base truncate flex-1 mr-4">
                {pr.recipe.title}
              </span>
              <button
                onClick={() => onRemoveRecipe(pr.id)}
                className="text-xs px-2.5 py-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/40 rounded transition-colors border border-red-500/20"
                title="Remove Recipe from Meal"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Scale (Multiplier)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={pr.scale}
                    data-testid={`scale-input-${pr.id}`}
                    onChange={(e) =>
                      onUpdatePlannedRecipe(pr.id, {
                        scale: parseFloat(e.target.value) || 1.0,
                      })
                    }
                    className="w-24 text-sm bg-zinc-850 border-zinc-700 text-zinc-200"
                  />
                  <span className="text-zinc-500 text-xs font-semibold">x</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Prep State Override (e.g. pre-diced)
                </label>
                <Input
                  value={pr.prepState || ""}
                  onChange={(e) =>
                    onUpdatePlannedRecipe(pr.id, {
                      prepState: e.target.value,
                    })
                  }
                  placeholder="No override"
                  className="text-sm bg-zinc-850 border-zinc-700 text-zinc-200"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800/80 pt-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pr.isLeftoverSource}
                  onChange={() => onToggleLeftoverSource(pr.id, !pr.isLeftoverSource)}
                  className="rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-blue-500"
                />
                Produces Leftovers (Leftover Source)
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pr.excludeFromPrep}
                  onChange={() => onUpdatePlannedRecipe(pr.id, { excludeFromPrep: !pr.excludeFromPrep })}
                  className="rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-blue-500"
                />
                Exclude from Prep List (NP)
              </label>
            </div>

            {!pr.isLeftoverSource && (
              <div className="flex items-center gap-3 border-t border-zinc-800/80 pt-3">
                <label className="text-xs font-semibold text-zinc-400 whitespace-nowrap">
                  Consume Leftovers From:
                </label>
                <Select
                  value={pr.sourcePlannedRecipeId || ""}
                  onChange={(e) => onLinkLeftover(pr.id, e.target.value || null)}
                  className={`text-xs bg-zinc-850 text-zinc-200 w-full max-w-[240px] ${
                    pr.sourcePlannedRecipeId ? "border-green-500/50" : "border-zinc-700"
                  }`}
                >
                  <option value="">None (Cook Fresh)</option>
                  {leftoverSourceOptions.map((source) => (
                    <option key={source.id} value={source.id}>
                      {new Date(source.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        ))}

        {meal.plannedRecipes.length === 0 && (
          <p className="text-zinc-500 text-center py-6 italic text-sm">
            No recipes planned for this slot yet.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-zinc-800 pt-4 mt-6">
        <button
          type="button"
          onClick={handleDeleteMeal}
          className="w-full sm:w-auto px-4 py-2 bg-red-950/20 text-red-400 hover:bg-red-950/40 rounded transition-colors text-sm font-semibold border border-red-500/20"
        >
          Delete Entire Meal Slot
        </button>

        <div className="flex w-full sm:w-auto gap-3 justify-end">
          <button
            type="button"
            onClick={handleAddRecipeClick}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors text-sm font-bold shadow-lg shadow-blue-500/10"
          >
            + Add Recipe
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-850 hover:bg-zinc-750 text-zinc-300 rounded transition-colors text-sm font-semibold border border-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
