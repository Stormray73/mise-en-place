"use client";

import { useState } from "react";
import {
  saveRecipeAction,
  getTagsAction,
  scrapeRecipeAction,
} from "@/app/recipes/actions";
import { useRouter } from "next/navigation";
import { getUnits } from "@/lib/units";
import { RecipeSaveData, Macros, USDAFood, RecipeSearchResult } from "@/types";
import { StepManager } from "./StepManager";
import { IngredientSearch } from "./IngredientSearch";
import { ComponentList } from "./ComponentList";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Autocomplete } from "./ui/Autocomplete";

interface RecipeEditorProps {
  initialData?: RecipeSaveData;
}

export function RecipeEditor({ initialData }: RecipeEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [isFavorite, setIsFavorite] = useState(
    initialData?.isFavorite || false,
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [yieldAmount, setYieldAmount] = useState(initialData?.yieldAmount || 1);
  const [yieldUnit, setYieldUnit] = useState(
    initialData?.yieldUnit || "servings",
  );
  const [servings, setServings] = useState<number | undefined>(
    initialData?.servings || undefined,
  );
  const [steps, setSteps] = useState<RecipeSaveData["steps"]>(
    initialData?.steps || [],
  );
  const [components, setComponents] = useState<RecipeSaveData["components"]>(
    initialData?.components || [],
  );
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    setError(null);
    try {
      const result = await scrapeRecipeAction(importUrl);
      if (result.success && result.data) {
        setTitle(result.data.title);
        setYieldAmount(result.data.yieldAmount);
        setYieldUnit(result.data.yieldUnit);
        setServings(result.data.servings || undefined);
        setSteps(result.data.steps);
        setComponents(result.data.components);
        setImportUrl("");
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to import recipe from URL.");
    } finally {
      setIsImporting(false);
    }
  };

  const addIngredient = (food: USDAFood) => {
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

    const baseMacros: Macros = {
      calories: energy,
      protein,
      fat,
      carbs,
    };

    const newComponent: RecipeSaveData["components"][0] = {
      type: "ingredient",
      quantity: 100,
      unit: "g",
      ingredientId: null,
      ingredient: {
        name: food.description,
        usdaId: food.fdcId.toString(),
        baseMacros,
        baseAmount: 100,
      },
    };
    setComponents([...components, newComponent]);
    setError(null);
  };

  const addSubRecipe = (recipe: RecipeSearchResult) => {
    if (recipe.id === initialData?.id) {
      setError("Cannot add a recipe to itself.");
      return;
    }

    const newComponent: RecipeSaveData["components"][0] = {
      type: "sub-recipe",
      quantity: recipe.yieldAmount,
      unit: recipe.yieldUnit,
      childRecipeId: recipe.id,
      childRecipe: {
        title: recipe.title,
      },
    };
    setComponents([...components, newComponent]);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Recipe title is required.");
      return;
    }

    const filteredSteps = steps
      .filter((s) => s.instruction.trim() !== "")
      .map((s, i) => ({ ...s, order: i + 1 }));

    const data: RecipeSaveData = {
      id: initialData?.id,
      title: title.trim(),
      isFavorite,
      tags,
      yieldAmount: parseFloat(yieldAmount.toString()),
      yieldUnit,
      servings: servings ? parseInt(servings.toString()) : null,
      steps: filteredSteps,
      components: components.map((c) => {
        if (c.type === "ingredient") {
          return {
            ...c,
            ingredientId: c.ingredientId || null,
          };
        } else {
          return {
            ...c,
            childRecipeId: c.childRecipeId || null,
          };
        }
      }),
    };
    try {
      const result = await saveRecipeAction(data);
      if (result.success) {
        router.push("/recipes");
      } else {
        setError(result.error);
      }
    } catch (err: unknown) {
      console.error("Failed to save recipe:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save recipe. Please try again.";
      setError(message);
    }
  };

  return (
    <Card className="p-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xl leading-none"
          >
            &times;
          </button>
        </div>
      )}

      <div className="mb-8 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Import from URL
        </label>
        <div className="flex gap-2">
          <Input
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://example.com/recipe"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={handleImport}
            disabled={isImporting || !importUrl}
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-zinc-500">
          Supports websites with Schema.org (JSON-LD) recipe metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-end gap-4">
            <div className="flex-1">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-zinc-400"
              >
                Recipe Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
                placeholder="e.g. Tomato Sauce"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`mb-1 p-2 rounded-md border transition-colors ${
                isFavorite
                  ? "bg-yellow-900/30 border-yellow-700 text-yellow-500"
                  : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300"
              }`}
              title={isFavorite ? "Unfavorite" : "Favorite"}
            >
              <span className="text-xl">{isFavorite ? "★" : "☆"}</span>
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="yieldAmount"
            className="block text-sm font-medium text-zinc-400"
          >
            Yield Amount
          </label>
          <Input
            id="yieldAmount"
            type="number"
            value={yieldAmount}
            onChange={(e) => setYieldAmount(parseFloat(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <label
            htmlFor="yieldUnit"
            className="block text-sm font-medium text-zinc-400"
          >
            Yield Unit
          </label>
          <Select
            id="yieldUnit"
            value={yieldUnit}
            onChange={(e) => setYieldUnit(e.target.value)}
            className="mt-1"
          >
            {getUnits().map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div>
          <label
            htmlFor="servings"
            className="block text-sm font-medium text-zinc-400"
          >
            Servings
          </label>
          <Input
            id="servings"
            type="number"
            value={servings || ""}
            onChange={(e) =>
              setServings(e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="mt-1"
            placeholder="e.g. 4"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded-md text-sm flex items-center gap-2 border border-zinc-700"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  className="text-zinc-500 hover:text-red-400"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <Autocomplete<string>
            placeholder="Add a tag..."
            onSearch={async (query) => {
              const res = await getTagsAction();
              if (res.success && res.data) {
                return res.data.filter(
                  (t) =>
                    t.toLowerCase().includes(query.toLowerCase()) &&
                    !tags.includes(t),
                );
              }
              return [];
            }}
            onSelect={(tag) => {
              if (!tags.includes(tag)) {
                setTags([...tags, tag]);
              }
            }}
            renderItem={(tag) => <span>#{tag}</span>}
            keyExtractor={(tag) => tag}
            minChars={1}
            footerAction={(query) =>
              query && !tags.includes(query) ? (
                <button
                  type="button"
                  onClick={() => {
                    setTags([...tags, query]);
                  }}
                  className="w-full text-left px-4 py-2 text-blue-400 hover:bg-zinc-700 text-sm font-bold"
                >
                  + Create Tag &quot;{query}&quot;
                </button>
              ) : null
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-zinc-800 pb-2">
          Ingredients
        </h3>

        <IngredientSearch
          onAddIngredient={addIngredient}
          onAddSubRecipe={addSubRecipe}
        />

        <ComponentList components={components} onChange={setComponents} />
      </div>

      <div className="mt-8">
        <StepManager steps={steps} onChange={setSteps} />
      </div>

      <div className="pt-8 border-t border-zinc-800 flex justify-end">
        <Button type="button" onClick={handleSave} size="lg">
          Save Recipe
        </Button>
      </div>
    </Card>
  );
}
