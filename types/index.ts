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

export interface RecipeComponent {
  id: string;
  quantity: number;
  unit: string;
  recipeId: string;
  ingredientId?: string | null;
  ingredient?: Ingredient | null;
  childRecipeId?: string | null;
  childRecipe?: Recipe | null;
}

export interface RecipeSaveData {
  id?: string;
  title: string;
  yieldAmount: number;
  yieldUnit: string;
  steps: {
    id?: string;
    order: number;
    instruction: string;
    timerInSeconds?: number | null;
  }[];
  components: {
    id?: string;
    quantity: number;
    unit: string;
    ingredientId?: string | null;
    childRecipeId?: string | null;
    // For UI preview
    ingredient?: {
      name: string;
      usdaId?: string | null;
      baseMacros?: Macros | null;
      baseAmount?: number | null;
    } | null;
    childRecipe?: {
      title: string;
    } | null;
  }[];
}
