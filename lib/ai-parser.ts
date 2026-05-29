import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const getOpenAIModel = () => {
  if (process.env.ENABLE_MSW === "true") {
    const customOpenAI = createOpenAI({
      apiKey: "mock-key",
      fetch: async (url, options) => {
        const body = JSON.parse(options?.body as string);

        let promptText = "";
        const messages = body.input || body.messages || [];
        const lastMsg = messages[messages.length - 1];
        if (lastMsg) {
          if (typeof lastMsg.content === "string") {
            promptText = lastMsg.content;
          } else if (Array.isArray(lastMsg.content)) {
            for (const part of lastMsg.content) {
              if (typeof part === "string") {
                promptText += part + " ";
              } else if (part && typeof part === "object" && "text" in part) {
                promptText += (part.text || "") + " ";
              }
            }
          }
        }
        if (!promptText && typeof body.prompt === "string") {
          promptText = body.prompt;
        }

        let contentObj: unknown;

        if (
          promptText.includes("recipes") ||
          promptText.includes("Extract all recipes") ||
          promptText.includes("bulk") ||
          promptText.includes("Pasta and Sauce")
        ) {
          contentObj = {
            recipes: [
              {
                title: "MSW Mock Bulk Pasta",
                yieldAmount: 2,
                yieldUnit: "servings",
                servings: null,
                steps: [{ instruction: "Boil water", timerInSeconds: 600 }],
                ingredients: [
                  { quantity: 200, unit: "g", name: "Pasta", prepState: "dry" },
                ],
              },
              {
                title: "MSW Mock Bulk Sauce",
                yieldAmount: 4,
                yieldUnit: "servings",
                servings: null,
                steps: [
                  { instruction: "Simmer tomatoes", timerInSeconds: 300 },
                ],
                ingredients: [
                  {
                    quantity: 400,
                    unit: "g",
                    name: "Tomatoes",
                    prepState: "crushed",
                  },
                  {
                    quantity: 1,
                    unit: "ea",
                    name: "MSW Mock Bulk Pasta",
                    prepState: null,
                  },
                ],
              },
            ],
          };
        } else if (
          promptText.includes("Parse the following list of ingredient strings")
        ) {
          contentObj = {
            ingredients: [
              { quantity: 200, unit: "g", name: "Pasta", prepState: "dry" },
            ],
          };
        } else {
          contentObj = {
            title: "MSW Mock Pasta",
            yieldAmount: 2,
            yieldUnit: "servings",
            servings: null,
            steps: [
              { instruction: "Boil water", timerInSeconds: 600 },
              { instruction: "Cook pasta", timerInSeconds: null },
            ],
            ingredients: [
              { quantity: 200, unit: "g", name: "Pasta", prepState: "dry" },
            ],
          };
        }

        // Return a mock response that conforms to the OpenAI Responses API schema
        const mockResponse = {
          id: "resp_mock",
          created_at: Math.floor(Date.now() / 1000),
          model: "gpt-4o-mini",
          output: [
            {
              type: "message",
              role: "assistant",
              id: "msg_mock",
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify(contentObj),
                  annotations: [],
                },
              ],
            },
          ],
          usage: {
            input_tokens: 10,
            output_tokens: 10,
            input_token_details: { cached_tokens: 0 },
            output_token_details: { reasoning_tokens: 0 },
          },
        };

        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    });
    return customOpenAI("gpt-4o-mini");
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { openai } = require("@ai-sdk/openai");
  return openai("gpt-4o-mini");
};

const IngredientSchema = z.object({
  quantity: z.number().describe("The numeric quantity of the ingredient"),
  unit: z
    .string()
    .describe("The unit of measure (e.g., 'cup', 'g', 'tsp', 'ea')"),
  name: z.string().describe("The name of the ingredient"),
  prepState: z
    .string()
    .nullable()
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
    .nullable()
    .describe("Number of servings if different from yield"),
  steps: z.array(
    z.object({
      instruction: z.string().describe("The step instruction text"),
      timerInSeconds: z
        .number()
        .nullable()
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
      model: getOpenAIModel(),
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
      model: getOpenAIModel(),
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

export function chunkText(text: string, maxChunkSize = 6000): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    const additionLength = trimmed.length + (currentChunk.length > 0 ? 2 : 0);

    if (
      currentLength + additionLength > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.join("\n\n"));
      currentChunk = [trimmed];
      currentLength = trimmed.length;
    } else {
      currentChunk.push(trimmed);
      currentLength += additionLength;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n\n"));
  }

  return chunks;
}

export async function parseBulkRecipes(
  text: string,
): Promise<z.infer<typeof RecipeSchema>[]> {
  const chunks = chunkText(text, 6000);
  const allRecipes: z.infer<typeof RecipeSchema>[] = [];

  for (const chunk of chunks) {
    try {
      const { object } = await generateObject({
        model: getOpenAIModel(),
        schema: z.object({
          recipes: z.array(RecipeSchema),
        }),
        prompt: `Extract all recipes found in the following text. 
        Look for cooking times in the instructions and convert them to seconds for the 'timerInSeconds' field.
        Handle fractions in ingredient quantities by converting to decimals.
        If only one recipe is found, return it in the 'recipes' array.
        
        Text:
        ${chunk}`,
      });

      if (object.recipes && Array.isArray(object.recipes)) {
        allRecipes.push(...object.recipes);
      }
    } catch (error) {
      console.error("AI Bulk Recipe Parsing failed for chunk:", error);
      throw error;
    }
  }

  return allRecipes;
}

export async function parseRecipeFromImage(imageUrl: string) {
  try {
    const { object } = await generateObject({
      model: getOpenAIModel(),
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
