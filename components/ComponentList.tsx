/**
 * @file ComponentList.tsx
 * @responsibility Manages the display and quantity/unit/prep-state logic for added ingredients.
 * @dependencies RecipeSaveData (types), getUnits (lib), Input, Select
 */

import { RecipeSaveData } from "@/types";
import { getUnits } from "@/lib/units";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ComponentListProps {
  components: RecipeSaveData["components"];
  onChange: (components: RecipeSaveData["components"]) => void;
}

export function ComponentList({ components, onChange }: ComponentListProps) {
  const removeComponent = (index: number) => {
    onChange(components.filter((_, i) => i !== index));
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

  return (
    <div className="space-y-2">
      {components.map((c, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-zinc-800 p-3 rounded-md border border-zinc-700"
        >
          <div className="flex-1 text-zinc-200 truncate">
            {c.type === "ingredient"
              ? c.ingredient?.name || "Ingredient"
              : c.childRecipe?.title || "Sub-recipe"}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24">
              <Input
                type="number"
                placeholder="Qty"
                value={c.quantity}
                onChange={(e) =>
                  updateComponent(i, { quantity: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="w-24">
              <Select
                value={c.unit}
                onChange={(e) => updateComponent(i, { unit: e.target.value })}
              >
                {getUnits().map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-32">
              <Input
                type="text"
                value={c.prepState || ""}
                onChange={(e) =>
                  updateComponent(i, { prepState: e.target.value })
                }
                placeholder="Prep (e.g. diced)"
              />
            </div>
            <button
              type="button"
              onClick={() => removeComponent(i)}
              className="text-zinc-500 hover:text-red-500 transition-colors text-xl leading-none ml-2"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
