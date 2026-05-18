import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const IngredientSchema = z.object({
  quantity: z.number().describe("The numeric quantity of the ingredient"),
  unit: z
    .string()
    .describe("The unit of measure (e.g., 'cup', 'g', 'tsp', 'ea')"),
  name: z.string().describe("The name of the ingredient"),
  prepState: z
    .string()
    .optional()
    .describe("Optional preparation state like 'chopped', 'melted', etc."),
});

const RecipeSchema = z.object({
  title: z.string().describe("The title of the recipe"),
  yieldAmount: z.number().describe("The number of servings or yield quantity"),
  yieldUnit: z
    .string()
    .describe("The unit for the yield (e.g., 'servings', 'cookies', 'loaves')"),
  servings: z
    .number()
    .optional()
    .describe("Number of servings if different from yield"),
  steps: z.array(
    z.object({
      instruction: z.string().describe("The step instruction text"),
      timerInSeconds: z
        .number()
        .optional()
        .describe(
          "Detected timer duration in seconds if mentioned in the instruction",
        ),
    }),
  ),
  ingredients: z.array(IngredientSchema),
});

export async function parseIngredients(rawIngredients: string[]) {
  if (rawIngredients.length === 0) return [];

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        ingredients: z.array(IngredientSchema),
      }),
      prompt: `Parse the following list of ingredient strings into structured data. 
      Handle fractions (like "1/2") by converting to decimals (0.5). 
      If no unit is specified, use "ea".
      
      Ingredients:
      ${rawIngredients.join("\n")}`,
    });

    return object.ingredients;
  } catch (error) {
    console.error("AI Ingredient Parsing failed:", error);
    // Fallback to raw mapping
    return rawIngredients.map((name) => ({
      quantity: 1,
      unit: "ea",
      name,
    }));
  }
}

export async function parseRecipe(text: string) {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: RecipeSchema,
      prompt: `Extract the recipe details from the following text. 
      Look for cooking times in the instructions and convert them to seconds for the 'timerInSeconds' field.
      Handle fractions in ingredient quantities by converting to decimals.
      
      Text:
      ${text}`,
    });

    return object;
  } catch (error) {
    console.error("AI Recipe Parsing failed:", error);
    throw error;
  }
}

export async function parseBulkRecipes(text: string) {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        recipes: z.array(RecipeSchema),
      }),
      prompt: `Extract all recipes found in the following text. 
      Look for cooking times in the instructions and convert them to seconds for the 'timerInSeconds' field.
      Handle fractions in ingredient quantities by converting to decimals.
      If only one recipe is found, return it in the 'recipes' array.
      
      Text:
      ${text}`,
    });

    return object.recipes;
  } catch (error) {
    console.error("AI Bulk Recipe Parsing failed:", error);
    throw error;
  }
}

export async function parseRecipeFromImage(imageUrl: string) {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: RecipeSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the recipe details from this image. Look for cooking times in the instructions and convert them to seconds for the 'timerInSeconds' field. Handle fractions in ingredient quantities by converting to decimals.",
            },
            { type: "image", image: imageUrl },
          ],
        },
      ],
    });

    return object;
  } catch (error) {
    console.error("AI Vision Recipe Parsing failed:", error);
    throw error;
  }
}
