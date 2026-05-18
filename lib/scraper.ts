import * as cheerio from "cheerio";
import { RecipeSaveData } from "@/types";
import { parseIngredients } from "./ai-parser";

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
        } else if (obj && typeof obj === "object" && obj !== null) {
          const record = obj as Record<string, unknown>;
          const type = record["@type"];
          if (
            typeof type === "string" &&
            (type === "Recipe" || type.includes("Recipe"))
          ) {
            return record as unknown as LDRecipe;
          }
          if (Array.isArray(type) && type.includes("Recipe")) {
            return record as unknown as LDRecipe;
          }

          const graph = record["@graph"];
          if (graph && Array.isArray(graph)) {
            return findRecipe(graph);
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
  const title = (recipeData as LDRecipe).name || "Imported Recipe";

  // Parse yield and servings
  let yieldAmount = 1;
  let yieldUnit = "portion";
  if ((recipeData as LDRecipe).recipeYield) {
    const yieldStr = Array.isArray((recipeData as LDRecipe).recipeYield)
      ? (recipeData as LDRecipe).recipeYield?.[0]
      : (recipeData as LDRecipe).recipeYield;
    if (yieldStr) {
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
  }

  const servings = (recipeData as LDRecipe).recipeYield
    ? yieldAmount
    : undefined;

  // Map ingredients
  const rawIngredients: string[] = Array.isArray(
    (recipeData as LDRecipe).recipeIngredient,
  )
    ? ((recipeData as LDRecipe).recipeIngredient as string[])
    : [];

  const parsedIngredients = await parseIngredients(rawIngredients);

  // Map instructions
  let steps: { order: number; instruction: string }[] = [];
  if (Array.isArray((recipeData as LDRecipe).recipeInstructions)) {
    steps = ((recipeData as LDRecipe).recipeInstructions as unknown[])
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
      .filter(
        (s: unknown): s is { order: number; instruction: string } =>
          s !== null &&
          typeof s === "object" &&
          "instruction" in (s as Record<string, unknown>),
      )
      .map((s, i) => ({ ...s, order: i + 1 }));
  }

  return {
    title,
    yieldAmount,
    yieldUnit,
    servings,
    steps: steps,
    components: parsedIngredients.map((ing) => ({
      type: "ingredient" as const,
      quantity: ing.quantity,
      unit: ing.unit,
      ingredientId: null,
      ingredient: {
        name: ing.name,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prepState: (ing as any).prepState,
    })),
  };
}
