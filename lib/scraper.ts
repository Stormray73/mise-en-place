import * as cheerio from "cheerio";
import { RecipeSaveData } from "@/types";

interface LDRecipe {
  "@type": string | string[];
  name?: string;
  recipeYield?: string | string[];
  recipeIngredient?: string[];
  recipeInstructions?: string | unknown[];
  "@graph"?: unknown[];
}

export async function scrapeRecipe(url: string): Promise<RecipeSaveData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch recipe from ${url}: ${response.statusText}`,
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const jsonLdScripts = $('script[type="application/ld+json"]');
  let recipeData: LDRecipe | null = null;

  jsonLdScripts.each((_, script) => {
    try {
      const json = JSON.parse($(script).html() || "");

      const findRecipe = (obj: unknown): LDRecipe | null => {
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const found = findRecipe(item);
            if (found) return found;
          }
        } else if (obj && typeof obj === "object") {
          const record = obj as Record<string, unknown>;
          if (
            record["@type"] === "Recipe" ||
            (Array.isArray(record["@type"]) &&
              (record["@type"] as string[]).includes("Recipe"))
          ) {
            return record as unknown as LDRecipe;
          }
          if (record["@graph"] && Array.isArray(record["@graph"])) {
            return findRecipe(record["@graph"]);
          }
        }
        return null;
      };

      const found = findRecipe(json);
      if (found) {
        recipeData = found;
        return false; // break each
      }
    } catch {
      // Ignore parse errors for individual scripts
    }
  });

  if (!recipeData) {
    throw new Error("No recipe metadata (JSON-LD) found on this page.");
  }

  // Map JSON-LD to RecipeSaveData
  const title = recipeData.name || "Imported Recipe";

  // Parse yield and servings
  let yieldAmount = 1;
  let yieldUnit = "portion";
  if (recipeData.recipeYield) {
    const yieldStr = Array.isArray(recipeData.recipeYield)
      ? recipeData.recipeYield[0]
      : recipeData.recipeYield;
    const match = yieldStr.toString().match(/(\d+)/);
    if (match) {
      yieldAmount = parseFloat(match[1]);
    }
    // Try to extract unit
    const unitMatch = yieldStr.toString().match(/[a-zA-Z]+/);
    if (unitMatch) {
      yieldUnit = unitMatch[0].toLowerCase();
    }
  }

  const servings = recipeData.recipeYield ? yieldAmount : undefined;

  // Map ingredients
  const ingredients: string[] = Array.isArray(recipeData.recipeIngredient)
    ? recipeData.recipeIngredient
    : [];

  // Map instructions
  let steps: { order: number; instruction: string }[] = [];
  if (Array.isArray(recipeData.recipeInstructions)) {
    steps = recipeData.recipeInstructions
      .map((step: unknown, index: number) => {
        if (typeof step === "string") {
          return { order: index + 1, instruction: step };
        } else if (step && typeof step === "object") {
          const s = step as Record<string, unknown>;
          if (s["@type"] === "HowToStep") {
            return {
              order: index + 1,
              instruction: (s.text as string) || (s.name as string),
            };
          } else if (
            s["@type"] === "HowToSection" &&
            Array.isArray(s.itemListElement)
          ) {
            // Flatten sections for now
            return (s.itemListElement as unknown[]).map((item: unknown) => {
              const i = item as Record<string, unknown>;
              return {
                instruction: (i.text as string) || (i.name as string),
              };
            });
          }
        }
        return null;
      })
      .flat()
      .filter((s): s is { order: number; instruction: string } => s !== null)
      .map((s, i) => ({ ...s, order: i + 1 }));
  }

  return {
    title,
    yieldAmount,
    yieldUnit,
    servings,
    steps: steps,
    components: ingredients.map((ing) => ({
      type: "ingredient",
      quantity: 1, // Placeholder, needs parser or manual adjustment
      unit: "ea", // Placeholder
      ingredient: {
        name: ing,
      },
    })),
  } as RecipeSaveData;
}
