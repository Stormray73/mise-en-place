import { useState } from "react";
import { RecipeSaveData } from "@/types";
import { getUnits } from "@/lib/units";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { saveCustomIngredientAction } from "@/app/recipes/ingredient-actions";

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

  // Macro definition form for dummy ingredients
  const [macroForm, setMacroForm] = useState<{
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

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

  const startEditing = (index: number, comp: RecipeSaveData["components"][0]) => {
    setEditingIndex(index);
    setEditQuantity(comp.quantity);
    setEditUnit(comp.unit);
    setEditPrepState(comp.prepState || "");
    setEditName(
      comp.type === "ingredient"
        ? comp.ingredient?.name || ""
        : comp.childRecipe?.title || ""
    );
    setMacroForm(null); // Reset dummy form
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setMacroForm(null);
  };

  const applyEdits = (index: number) => {
    const original = components[index];
    const updates: any = {
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

    updateComponent(index, updates);
    setEditingIndex(null);
  };

  const convertDummyIngredient = async (index: number) => {
    if (!macroForm || !editName.trim()) return;

    setIsConverting(true);
    try {
      const macros = {
        calories: parseFloat(macroForm.calories) || 0,
        protein: parseFloat(macroForm.protein) || 0,
        fat: parseFloat(macroForm.fat) || 0,
        carbs: parseFloat(macroForm.carbs) || 0,
      };

      const res = await saveCustomIngredientAction({
        name: editName,
        baseAmount: 100,
        unit: "g",
        macros,
      });

      if (res.success) {
        // Successfully saved in DB. Now update this component row with database ingredient ID and metadata
        updateComponent(index, {
          ingredientId: res.data.id,
          quantity: editQuantity,
          unit: editUnit,
          prepState: editPrepState || null,
          ingredient: {
            name: editName,
            usdaId: null,
            baseAmount: 100,
            baseMacros: macros,
          },
        } as any);
        setEditingIndex(null);
        setMacroForm(null);
      } else {
        alert(res.error || "Failed to convert ingredient.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving custom ingredient.");
    } finally {
      setIsConverting(false);
    }
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
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Ingredient Name"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 0)}
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
                  <div className="border-t border-zinc-800/80 pt-3 mt-1 flex flex-col gap-2">
                    {!macroForm ? (
                      <button
                        type="button"
                        onClick={() =>
                          setMacroForm({
                            calories: "0",
                            protein: "0",
                            fat: "0",
                            carbs: "0",
                          })
                        }
                        className="text-xs text-blue-400 hover:text-blue-300 text-left font-bold flex items-center gap-1"
                      >
                        💡 This is an imported dummy ingredient. Define Macros & Save to My Ingredients
                      </button>
                    ) : (
                      <div className="bg-zinc-900/60 p-3 rounded border border-zinc-800 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-zinc-300">
                            Define Macros (per 100g)
                          </span>
                          <button
                            type="button"
                            onClick={() => setMacroForm(null)}
                            className="text-zinc-500 hover:text-zinc-300 text-xs font-bold"
                          >
                            Hide
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-[10px] text-zinc-400 mb-0.5">
                              Calories
                            </label>
                            <Input
                              type="number"
                              value={macroForm.calories}
                              onChange={(e) =>
                                setMacroForm({ ...macroForm, calories: e.target.value })
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 mb-0.5">
                              Protein (g)
                            </label>
                            <Input
                              type="number"
                              value={macroForm.protein}
                              onChange={(e) =>
                                setMacroForm({ ...macroForm, protein: e.target.value })
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 mb-0.5">
                              Fat (g)
                            </label>
                            <Input
                              type="number"
                              value={macroForm.fat}
                              onChange={(e) =>
                                setMacroForm({ ...macroForm, fat: e.target.value })
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 mb-0.5">
                              Carbs (g)
                            </label>
                            <Input
                              type="number"
                              value={macroForm.carbs}
                              onChange={(e) =>
                                setMacroForm({ ...macroForm, carbs: e.target.value })
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => convertDummyIngredient(i)}
                            disabled={isConverting || !editName.trim()}
                          >
                            {isConverting ? "Saving..." : "Save Custom Ingredient"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
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
              needsReview ? "border-yellow-500/50 bg-yellow-950/10" : "border-zinc-700"
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
