import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { saveCustomIngredientAction } from "@/app/recipes/ingredient-actions";

interface DummyIngredientConverterProps {
  ingredientName: string;
  onSave: (
    macros: { calories: number; protein: number; fat: number; carbs: number },
    ingredientId: string,
  ) => void;
}

export function DummyIngredientConverter({
  ingredientName,
  onSave,
}: DummyIngredientConverterProps) {
  const [macroForm, setMacroForm] = useState<{
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
  } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!macroForm || !ingredientName.trim()) return;

    setIsConverting(true);
    try {
      const macros = {
        calories: parseFloat(macroForm.calories) || 0,
        protein: parseFloat(macroForm.protein) || 0,
        fat: parseFloat(macroForm.fat) || 0,
        carbs: parseFloat(macroForm.carbs) || 0,
      };

      const res = await saveCustomIngredientAction({
        name: ingredientName,
        baseAmount: 100,
        unit: "g",
        macros,
      });

      if (res.success) {
        onSave(macros, res.data.id);
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
          💡 This is an imported dummy ingredient. Define Macros & Save to My
          Ingredients
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
                  setMacroForm({
                    ...macroForm,
                    calories: e.target.value,
                  })
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
                  setMacroForm({
                    ...macroForm,
                    protein: e.target.value,
                  })
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
                  setMacroForm({
                    ...macroForm,
                    fat: e.target.value,
                  })
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
                  setMacroForm({
                    ...macroForm,
                    carbs: e.target.value,
                  })
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleConvert}
              disabled={isConverting || !ingredientName.trim()}
            >
              {isConverting ? "Saving..." : "Save Custom Ingredient"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
