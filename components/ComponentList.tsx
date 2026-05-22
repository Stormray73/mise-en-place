import { useState } from "react";
import { RecipeSaveData, Macros, USDAFood } from "@/types";
import { getUnits } from "@/lib/units";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DummyIngredientConverter } from "./DummyIngredientConverter";
import { Autocomplete } from "./ui/Autocomplete";

const extractMacros = (food: USDAFood): Macros => {
  const energy =
    food.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0;
  const protein =
    food.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0;
  const fat =
    food.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")
      ?.value || 0;
  const carbs =
    food.foodNutrients.find(
      (n) => n.nutrientName === "Carbohydrate, by difference",
    )?.value || 0;

  return {
    calories: energy,
    protein,
    fat,
    carbs,
  };
};

interface ComponentListProps {
  components: RecipeSaveData["components"];
  onChange: (components: RecipeSaveData["components"]) => void;
}

export function ComponentList({ components, onChange }: ComponentListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Inline editing temp states
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<string>("");
  const [editName, setEditName] = useState<string>("");
  const [editPrepState, setEditPrepState] = useState<string>("");

  const removeComponent = (index: number) => {
    onChange(components.filter((_, i) => i !== index));
    if (editingIndex === index) {
      cancelEditing();
    }
  };

  const updateComponent = (
    index: number,
    updates: Partial<RecipeSaveData["components"][0]>,
  ) => {
    const newComponents = [...components];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newComponents[index] = { ...newComponents[index], ...updates } as any;
    onChange(newComponents);
  };

  const startEditing = (
    index: number,
    comp: RecipeSaveData["components"][0],
  ) => {
    setEditingIndex(index);
    setEditQuantity(comp.quantity);
    setEditUnit(comp.unit);
    setEditPrepState(comp.prepState || "");
    setEditName(
      comp.type === "ingredient"
        ? comp.ingredient?.name || ""
        : comp.childRecipe?.title || "",
    );
  };

  const cancelEditing = () => {
    setEditingIndex(null);
  };

  const applyEdits = (index: number) => {
    const original = components[index];
    const updates: Record<string, unknown> = {
      quantity: editQuantity,
      unit: editUnit,
      prepState: editPrepState || null,
    };

    if (original.type === "ingredient") {
      updates.ingredient = {
        ...(original.ingredient || { name: "" }),
        name: editName,
      };
    } else {
      updates.childRecipe = {
        ...(original.childRecipe || { title: "" }),
        title: editName,
      };
    }

    updateComponent(index, updates as Partial<RecipeSaveData["components"][0]>);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-2">
      {components.map((c, i) => {
        const isEditing = editingIndex === i;

        if (isEditing) {
          return (
            <div
              key={i}
              className="flex flex-col gap-3 bg-zinc-850 p-4 rounded-md border border-blue-500/50 shadow-lg shadow-blue-500/5 transition-all duration-200"
            >
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Name
                  </label>
                  {c.type === "ingredient" ? (
                    <Autocomplete<USDAFood>
                      placeholder="Search or type ingredient..."
                      initialValue={editName}
                      clearOnSelect={false}
                      onChange={(val) => setEditName(val)}
                      onSearch={async (query) => {
                        const res = await fetch(
                          `/api/usda/search?q=${encodeURIComponent(query)}`,
                        );
                        const data = await res.json();
                        return data.foods || [];
                      }}
                      onSelect={(food) => {
                        const baseMacros = extractMacros(food);
                        setEditName(food.description);
                        updateComponent(i, {
                          quantity: editQuantity,
                          unit: editUnit,
                          prepState: editPrepState || null,
                          ingredientId: null,
                          ingredient: {
                            name: food.description,
                            usdaId: food.fdcId.toString(),
                            baseMacros,
                            baseAmount: food.baseAmount || 100,
                          },
                        } as Partial<RecipeSaveData["components"][0]>);
                      }}
                      minChars={3}
                      keyExtractor={(food) => food.fdcId.toString()}
                      renderItem={(food) => (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium flex items-center gap-2 text-zinc-100 text-left">
                              <span>{food.description}</span>
                              {food.source && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                    food.source === "Local"
                                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                      : food.source === "OFF"
                                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  }`}
                                >
                                  {food.source}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 text-left">
                              {food.foodCategory}
                            </div>
                          </div>
                        </div>
                      )}
                      footerAction={(query) => (
                        <button
                          type="button"
                          onClick={() => {
                            setEditName(query);
                            updateComponent(i, {
                              quantity: editQuantity,
                              unit: editUnit,
                              prepState: editPrepState || null,
                              ingredientId: null,
                              ingredient: {
                                name: query,
                                usdaId: null,
                                baseAmount: 100,
                                baseMacros: null,
                              },
                            } as Partial<RecipeSaveData["components"][0]>);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-blue-400 hover:bg-zinc-700 transition-colors"
                        >
                          + Use &quot;{query}&quot; as custom/dummy ingredient
                        </button>
                      )}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Sub-recipe Title"
                    />
                  )}
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    value={editQuantity}
                    onChange={(e) =>
                      setEditQuantity(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Qty"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Unit
                  </label>
                  <Select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                  >
                    {getUnits().map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Prep State
                  </label>
                  <Input
                    type="text"
                    value={editPrepState}
                    onChange={(e) => setEditPrepState(e.target.value)}
                    placeholder="diced, minced..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyEdits(i)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                    title="Apply changes"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
                    title="Cancel"
                  >
                    <svg
                      className="w-5 h-5"
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
                </div>
              </div>

              {/* Dummy ingredient conversion section */}
              {c.type === "ingredient" &&
                !c.ingredient?.usdaId &&
                !c.ingredientId &&
                !c.ingredient?.userId && (
                  <DummyIngredientConverter
                    ingredientName={editName}
                    onSave={(macros, ingredientId) => {
                      updateComponent(i, {
                        ingredientId,
                        quantity: editQuantity,
                        unit: editUnit,
                        prepState: editPrepState || null,
                        ingredient: {
                          name: editName,
                          usdaId: null,
                          baseAmount: 100,
                          baseMacros: macros,
                        },
                      } as Partial<RecipeSaveData["components"][0]>);
                      setEditingIndex(null);
                    }}
                  />
                )}
            </div>
          );
        }

        // Default display mode (with yellow review indicator if needed in Epic 2)
        const needsReview = c.type === "ingredient" && c.needsReview;

        return (
          <div
            key={i}
            className={`flex items-center justify-between gap-3 bg-zinc-800 p-3 rounded-md border transition-all duration-200 ${
              needsReview
                ? "border-yellow-500/50 bg-yellow-950/10"
                : "border-zinc-700"
            }`}
          >
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {needsReview && (
                <span
                  className="text-yellow-500 cursor-pointer"
                  onClick={() => startEditing(i, c)}
                  title="Fuzzy matched or dummy ingredient. Needs review! Click pencil to resolve."
                >
                  ⚠️
                </span>
              )}
              <div className="truncate text-zinc-200">
                <span className="font-semibold text-zinc-400 mr-2">
                  {c.quantity} {c.unit}
                </span>
                <span className="font-medium text-zinc-100">
                  {c.type === "ingredient"
                    ? c.ingredient?.name || "Ingredient"
                    : c.childRecipe?.title || "Sub-recipe"}
                </span>
                {c.prepState && (
                  <span className="text-zinc-500 text-sm ml-2 font-normal">
                    ({c.prepState})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => startEditing(i, c)}
                className="p-1.5 text-zinc-400 hover:text-blue-400 transition-colors"
                title="Edit inline"
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
                    d="M15.232 5.232l3.536 3.536m-2.036-2.036a5 5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeComponent(i)}
                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                title="Remove"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
