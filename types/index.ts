export interface Tag {
  id: string;
  name: string;
  userId: string;
}

export interface RecipeSaveData {
  id?: string;
  title: string;
  yieldAmount: number;
  yieldUnit: string;
  servings?: number | null;
  isFavorite?: boolean;
  tags?: string[]; // Tag names
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
          foodPortions?: unknown | null;
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

export interface USDAFoodPortion {
  gramWeight: number;
  modifier: string;
  amount: number;
  measureUnitName: string;
}

export interface USDAFood {
  fdcId: number | string;
  description: string;
  foodCategory: string;
  foodNutrients: USDANutrient[];
  foodPortions?: USDAFoodPortion[];
  userId?: string | null;
  baseAmount?: number | null;
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
  foodPortions?: unknown; // JSON from Prisma
}

export interface Recipe {
  id: string;
  title: string;
  yieldAmount: number;
  yieldUnit: string;
  servings?: number | null;
  userId: string;
  isFavorite: boolean;
  tags?: Tag[];
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
  excludeFromPrep: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PantryLocation {
  id: string;
  name: string;
  userId: string;
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
