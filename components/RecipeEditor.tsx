"use client";

import { useState, useEffect, useRef } from "react";
import { saveRecipeAction } from "@/app/recipes/actions";
import { useRouter } from "next/navigation";
import { getUnits } from "@/lib/units";
import { RecipeSaveData, Macros } from "@/types";

interface RecipeEditorProps {
  initialData?: RecipeSaveData;
}

interface USDANutrient {
  nutrientName: string;
  value: number;
}

interface USDAFood {
  fdcId: number;
  description: string;
  foodCategory: string;
  foodNutrients: USDANutrient[];
}

interface RecipeSearchResult {
  id: string;
  title: string;
  yieldAmount: number;
  yieldUnit: string;
}

export function RecipeEditor({ initialData }: RecipeEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<USDAFood[]>([]);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [recipeSearchResults, setRecipeSearchResults] = useState<
    RecipeSearchResult[]
  >([]);
  const [isSearchingRecipes, setIsSearchingRecipes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usdaSearchRef = useRef<HTMLDivElement>(null);
  const recipeSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        usdaSearchRef.current &&
        !usdaSearchRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
      if (
        recipeSearchRef.current &&
        !recipeSearchRef.current.contains(event.target as Node)
      ) {
        setRecipeSearchResults([]);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchResults([]);
        setRecipeSearchResults([]);
        setSearchQuery("");
        setRecipeSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/usda/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setSearchResults(data.foods || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleRecipeSearch = async (query: string) => {
    setRecipeSearchQuery(query);
    if (query.length < 2) {
      setRecipeSearchResults([]);
      return;
    }
    setIsSearchingRecipes(true);
    try {
      const res = await fetch(
        `/api/recipes/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setRecipeSearchResults(data.recipes || []);
    } catch (error) {
      console.error("Recipe Search error:", error);
    } finally {
      setIsSearchingRecipes(false);
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
      quantity: 100,
      unit: "g",
      ingredient: {
        name: food.description,
        usdaId: food.fdcId.toString(),
        baseMacros,
        baseAmount: 100,
      },
    };
    setComponents([...components, newComponent]);
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  };

  const addSubRecipe = (recipe: RecipeSearchResult) => {
    if (recipe.id === initialData?.id) {
      setError("Cannot add a recipe to itself.");
      return;
    }

    const newComponent: RecipeSaveData["components"][0] = {
      quantity: recipe.yieldAmount,
      unit: recipe.yieldUnit,
      childRecipeId: recipe.id,
      childRecipe: {
        title: recipe.title,
      },
    };
    setComponents([...components, newComponent]);
    setRecipeSearchQuery("");
    setRecipeSearchResults([]);
    setError(null);
  };

  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, instruction: "" }]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(newSteps);
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
      yieldAmount: parseFloat(yieldAmount.toString()),
      yieldUnit,
      servings: servings ? parseInt(servings.toString()) : null,
      steps: filteredSteps,
      components: components.map((c) => ({
        ...c,
        ingredientId: c.ingredientId || null,
        childRecipeId: c.childRecipeId || null,
      })),
    };
    try {
      await saveRecipeAction(data);
      router.push("/dashboard");
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
    <div className="space-y-8 p-6 bg-zinc-900 text-white rounded-lg border border-zinc-800">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md relative flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xl leading-none"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-zinc-400"
          >
            Recipe Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Tomato Sauce"
          />
        </div>
        <div>
          <label
            htmlFor="yieldAmount"
            className="block text-sm font-medium text-zinc-400"
          >
            Yield Amount
          </label>
          <input
            id="yieldAmount"
            type="number"
            value={yieldAmount}
            onChange={(e) => setYieldAmount(parseFloat(e.target.value))}
            className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="yieldUnit"
            className="block text-sm font-medium text-zinc-400"
          >
            Yield Unit
          </label>
          <select
            id="yieldUnit"
            value={yieldUnit}
            onChange={(e) => setYieldUnit(e.target.value)}
            className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {getUnits().map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="servings"
            className="block text-sm font-medium text-zinc-400"
          >
            Servings
          </label>
          <input
            id="servings"
            type="number"
            value={servings || ""}
            onChange={(e) =>
              setServings(e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="mt-1 block w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. 4"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-zinc-800 pb-2">
          Ingredients
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" ref={usdaSearchRef}>
            <label className="text-xs text-zinc-500 mb-1 block">
              Add USDA Ingredient
            </label>
            <input
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl max-h-60 overflow-auto">
                {searchResults.map((food) => (
                  <button
                    key={food.fdcId}
                    type="button"
                    onClick={() => addIngredient(food)}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-0"
                  >
                    <div className="font-medium">{food.description}</div>
                    <div className="text-xs text-zinc-400">
                      {food.foodCategory}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={recipeSearchRef}>
            <label className="text-xs text-zinc-500 mb-1 block">
              Add Sub-recipe
            </label>
            <input
              placeholder="Search recipes..."
              value={recipeSearchQuery}
              onChange={(e) => handleRecipeSearch(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {recipeSearchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl max-h-60 overflow-auto">
                {recipeSearchResults.map((recipe) => (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => addSubRecipe(recipe)}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-0"
                  >
                    <div className="font-medium">{recipe.title}</div>
                    <div className="text-xs text-zinc-400">
                      Yield: {recipe.yieldAmount} {recipe.yieldUnit}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {isSearchingRecipes && (
              <div className="absolute right-2 top-8 text-xs text-zinc-500">
                Searching...
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {components.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-zinc-800 p-3 rounded-md border border-zinc-700"
            >
              <input
                type="text"
                readOnly
                value={
                  c.ingredient?.name || c.childRecipe?.title || "Sub-recipe"
                }
                className="flex-1 bg-transparent border-none outline-none text-zinc-200"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={c.quantity}
                  onChange={(e) => {
                    const newComponents = [...components];
                    newComponents[i].quantity = parseFloat(e.target.value);
                    setComponents(newComponents);
                  }}
                  className="w-24 bg-zinc-700 border border-zinc-600 rounded-md p-1 text-center"
                />
                <select
                  value={c.unit}
                  onChange={(e) => {
                    const newComponents = [...components];
                    newComponents[i].unit = e.target.value;
                    setComponents(newComponents);
                  }}
                  className="bg-zinc-800 border border-zinc-700 rounded p-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {getUnits().map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={c.prepState || ""}
                  onChange={(e) => {
                    const newComponents = [...components];
                    newComponents[i].prepState = e.target.value;
                    setComponents(newComponents);
                  }}
                  className="w-24 bg-zinc-800 border border-zinc-700 rounded p-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Prep (e.g. diced)"
                />
                <button
                  type="button"
                  onClick={() =>
                    setComponents(components.filter((_, idx) => idx !== i))
                  }
                  className="text-zinc-500 hover:text-red-500 transition-colors text-xl leading-none"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <h3 className="text-xl font-semibold">Instructions</h3>
          <button
            type="button"
            onClick={addStep}
            className="px-4 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-sm transition-colors"
          >
            Add Step
          </button>
        </div>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-none w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-sm">
                {step.order}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <textarea
                  placeholder={`Instruction for step ${step.order}`}
                  value={step.instruction}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[i].instruction = e.target.value;
                    setSteps(newSteps);
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-500">Timer (min):</label>
                  <input
                    type="number"
                    placeholder="None"
                    value={
                      step.timerInSeconds
                        ? Math.floor(step.timerInSeconds / 60)
                        : ""
                    }
                    onChange={(e) => {
                      const newSteps = [...steps];
                      const mins = parseInt(e.target.value);
                      newSteps[i].timerInSeconds = isNaN(mins)
                        ? null
                        : mins * 60;
                      setSteps(newSteps);
                    }}
                    className="w-20 bg-zinc-700 border border-zinc-600 rounded-md p-1 text-sm text-center"
                  />
                </div>
              </div>
              <button
                type="button"
                aria-label={`Remove Step ${step.order}`}
                onClick={() => removeStep(i)}
                className="text-zinc-500 hover:text-red-500 transition-colors text-2xl leading-none self-start"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-800 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-10 py-3 bg-white text-black hover:bg-zinc-200 rounded-full font-bold transition-all transform hover:scale-105"
        >
          Save Recipe
        </button>
      </div>
    </div>
  );
}
