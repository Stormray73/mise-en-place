export interface RecipeSaveData {
  id?: string;
  title: string;
  yieldAmount: number;
  yieldUnit: string;
  servings?: number | null;
  steps: {
    id?: string;
    order: number;
    instruction: string;
    timerInSeconds?: number | null;
  }[];
  components: ((
    | {
        type: "ingredient";
        ingredientId: string | null;
        ingredient?: {
          name: string;
          usdaId?: string | null;
          baseMacros?: Macros | null;
          baseAmount?: number | null;
        } | null;
      }
    | {
        type: "sub-recipe";
        childRecipeId: string | null;
        childRecipe?: {
          title: string;
        } | null;
      }
  ) & {
    id?: string;
    quantity: number;
    unit: string;
    prepState?: string | null;
  })[];
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface USDANutrient {
  nutrientName: string;
  value: number;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  foodCategory: string;
  foodNutrients: USDANutrient[];
}

export interface RecipeSearchResult {
  id: string;
  title: string;
  yieldAmount: number;
  yieldUnit: string;
}

export interface Macros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Ingredient {
  id: string;
  name: string;
  usdaId?: string | null;
  baseMacros?: unknown; // JSON from Prisma
  baseAmount?: number | null;
}

export interface Recipe {
  id: string;
  title: string;
  yieldAmount: number;
  yieldUnit: string;
  servings?: number | null;
  userId: string;
  manualMacros?: unknown; // JSON from Prisma
  steps?: RecipeStep[];
  components?: RecipeComponent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeStep {
  id: string;
  order: number;
  instruction: string;
  timerInSeconds?: number | null;
  recipeId: string;
}

export type RecipeComponent = (
  | {
      type: "ingredient";
      ingredientId: string;
      ingredient?: Ingredient | null;
    }
  | {
      type: "sub-recipe";
      childRecipeId: string;
      childRecipe?: Recipe | null;
    }
) & {
  id: string;
  quantity: number;
  unit: string;
  prepState?: string | null;
  recipeId: string;
};

export interface Meal {
  id: string;
  date: Date | string;
  slot: string;
  mealPlanId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannedRecipe {
  id: string;
  mealId: string;
  recipeId: string;
  scale: number;
  prepState?: string | null;
  isLeftoverSource: boolean;
  sourcePlannedRecipeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrepItem {
  id: string;
  type: "ingredient" | "recipe";
  name: string;
  quantity: number;
  unit: string;
  prepState?: string;
  completed: boolean;
}
