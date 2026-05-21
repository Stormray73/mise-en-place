import { prisma } from "./prisma";
import { Macros, USDANutrient } from "@/types";
import { Prisma } from "@prisma/client";
import { USDAFoodPortion } from "./units";

export function determineDepartment(name: string, category?: string): string {
  const lowercaseName = name.toLowerCase();
  const lowercaseCategory = (category || "").toLowerCase();

  if (
    /chicken|beef|pork|turkey|lamb|veal|bacon|sausage|ham|steak|meat|fish|salmon|tuna|shrimp|crab|lobster|cod|halibut|scallop|fillet|breasts|thighs|wings/i.test(
      lowercaseName,
    ) ||
    /meat|poultry|seafood|fish/i.test(lowercaseCategory)
  ) {
    return "Meat & Seafood";
  }

  if (
    /apple|banana|orange|grape|berry|lemon|lime|melon|peach|pear|plum|onion|garlic|tomato|potato|carrot|celery|broccoli|cauliflower|spinach|lettuce|salad|cabbage|pepper|squash|zucchini|cucumber|asparagus|mushroom|ginger|herb|cilantro|parsley|basil|rosemary|thyme|mint|avocado/i.test(
      lowercaseName,
    ) ||
    /produce|fruit|vegetable/i.test(lowercaseCategory)
  ) {
    return "Produce";
  }

  if (
    /milk|cheese|egg|butter|cream|yogurt|dairy|sour cream|parmesan|cheddar|mozzarella|ricotta|heavy cream/i.test(
      lowercaseName,
    ) ||
    /dairy|egg|cheese/i.test(lowercaseCategory)
  ) {
    return "Dairy & Eggs";
  }

  if (
    /bread|bun|roll|tortilla|bagel|pastry|crust|wrap|pita|naan/i.test(
      lowercaseName,
    ) ||
    /bakery|bread/i.test(lowercaseCategory)
  ) {
    return "Bakery";
  }

  if (
    /frozen|ice cream|pizza|waffle|fries/i.test(lowercaseName) ||
    /frozen/i.test(lowercaseCategory)
  ) {
    return "Frozen";
  }

  if (
    /water|juice|soda|coffee|tea|coke|sprite|beverage|drink/i.test(
      lowercaseName,
    ) ||
    /beverage|drink/i.test(lowercaseCategory)
  ) {
    return "Beverages";
  }

  return "Pantry";
}

export async function upsertIngredient(data: {
  name: string;
  usdaId?: string;
  baseMacros?: Macros;
  baseAmount?: number;
  foodPortions?: USDAFoodPortion[];
}) {
  const department = determineDepartment(data.name);

  if (!data.usdaId) {
    return prisma.ingredient.create({
      data: {
        name: data.name,
        baseMacros: data.baseMacros as unknown as Prisma.InputJsonValue,
        baseAmount: data.baseAmount,
        foodPortions: data.foodPortions as unknown as Prisma.InputJsonValue,
        department,
      },
    });
  }

  return prisma.ingredient.upsert({
    where: { usdaId: data.usdaId },
    update: {
      name: data.name,
      baseMacros: data.baseMacros as unknown as Prisma.InputJsonValue,
      baseAmount: data.baseAmount,
      foodPortions: data.foodPortions as unknown as Prisma.InputJsonValue,
      department,
    },
    create: {
      name: data.name,
      usdaId: data.usdaId,
      baseMacros: data.baseMacros as unknown as Prisma.InputJsonValue,
      baseAmount: data.baseAmount,
      foodPortions: data.foodPortions as unknown as Prisma.InputJsonValue,
      department,
    },
  });
}

export function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j, val;
  for (i = 0; i <= a.length; i++) {
    tmp.push([i]);
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      val = a[i - 1] === b[j - 1] ? 0 : 1;
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + val, // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

export function getSimilarity(s1: string, s2: string): number {
  const m = Math.max(s1.length, s2.length);
  if (m === 0) return 1;
  const dist = getLevenshteinDistance(
    s1.trim().toLowerCase(),
    s2.trim().toLowerCase(),
  );
  return 1 - dist / m;
}

export async function matchIngredientFuzzy(name: string) {
  // 1. Search local DB
  const dbIngredients = await prisma.ingredient.findMany({
    select: {
      id: true,
      name: true,
      usdaId: true,
      baseMacros: true,
      baseAmount: true,
      foodPortions: true,
    },
  });

  let bestMatch: (typeof dbIngredients)[0] | null = null;
  let highestSimilarity = 0;

  for (const dbIng of dbIngredients) {
    const similarity = getSimilarity(name, dbIng.name);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = dbIng;
    }
  }

  if (bestMatch && highestSimilarity >= 0.85) {
    return {
      ingredientId: bestMatch.id,
      ingredient: {
        name: bestMatch.name,
        usdaId: bestMatch.usdaId,
        baseMacros: bestMatch.baseMacros as unknown as Macros,
        baseAmount: bestMatch.baseAmount,
        foodPortions: bestMatch.foodPortions as unknown as USDAFoodPortion[],
      },
      needsReview: false,
    };
  }

  // 2. Fallback: Search USDA
  const apiKey = process.env.USDA_API_KEY;
  if (apiKey) {
    try {
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const usdaFoods = data.foods || [];
        for (const food of usdaFoods) {
          const similarity = getSimilarity(name, food.description);
          if (similarity >= 0.85) {
            const kcal =
              food.foodNutrients?.find(
                (n: USDANutrient) => n.nutrientName === "Energy",
              )?.value || 0;
            const protein =
              food.foodNutrients?.find(
                (n: USDANutrient) => n.nutrientName === "Protein",
              )?.value || 0;
            const fat =
              food.foodNutrients?.find(
                (n: USDANutrient) => n.nutrientName === "Total lipid (fat)",
              )?.value || 0;
            const carbs =
              food.foodNutrients?.find(
                (n: USDANutrient) =>
                  n.nutrientName === "Carbohydrate, by difference",
              )?.value || 0;

            const baseMacros: Macros = {
              calories: kcal,
              protein,
              fat,
              carbs,
            };

            const created = await upsertIngredient({
              name: food.description,
              usdaId: food.fdcId.toString(),
              baseMacros,
              baseAmount: 100,
              foodPortions: food.foodPortions || [],
            });

            return {
              ingredientId: created.id,
              ingredient: {
                name: created.name,
                usdaId: created.usdaId,
                baseMacros: created.baseMacros as unknown as Macros,
                baseAmount: created.baseAmount,
                foodPortions:
                  created.foodPortions as unknown as USDAFoodPortion[],
              },
              needsReview: false,
            };
          }
        }
      }
    } catch (err) {
      console.error("USDA fuzzy fetch failed:", err);
    }
  }

  // 3. Fallback: Search Open Food Facts
  try {
    const { searchOpenFoodFacts } = await import("./off");
    const offFoods = await searchOpenFoodFacts(name);
    for (const food of offFoods) {
      const similarity = getSimilarity(name, food.description);
      if (similarity >= 0.85) {
        const kcal =
          food.foodNutrients.find((n) => n.nutrientName === "Energy")?.value ||
          0;
        const protein =
          food.foodNutrients.find((n) => n.nutrientName === "Protein")?.value ||
          0;
        const fat =
          food.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")
            ?.value || 0;
        const carbs =
          food.foodNutrients.find(
            (n) => n.nutrientName === "Carbohydrate, by difference",
          )?.value || 0;

        const baseMacros: Macros = {
          calories: kcal,
          protein,
          fat,
          carbs,
        };

        const created = await upsertIngredient({
          name: food.description,
          usdaId: food.fdcId,
          baseMacros,
          baseAmount: 100,
          foodPortions:
            (food.foodPortions as unknown as USDAFoodPortion[]) || [],
        });

        return {
          ingredientId: created.id,
          ingredient: {
            name: created.name,
            usdaId: created.usdaId,
            baseMacros: created.baseMacros as unknown as Macros,
            baseAmount: created.baseAmount,
            foodPortions: created.foodPortions as unknown as USDAFoodPortion[],
          },
          needsReview: false,
        };
      }
    }
  } catch (err) {
    console.error("OFF fuzzy fetch failed:", err);
  }

  return {
    ingredientId: null,
    ingredient: {
      name,
    },
    needsReview: true,
  };
}
