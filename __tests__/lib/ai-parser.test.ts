import { describe, it, expect } from "vitest";
import { chunkText, parseBulkRecipes } from "@/lib/ai-parser";

// Set ENABLE_MSW="true" to use the mocked OpenAI model
process.env.ENABLE_MSW = "true";

describe("AI Parser Chunking & Bulk Parsing", () => {
  describe("chunkText", () => {
    it("should not chunk text under the limit", () => {
      const text =
        "Recipe 1\n\nIngredients:\n1 cup flour\n\nInstructions:\nBake.";
      const chunks = chunkText(text, 100);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(text);
    });

    it("should chunk large text at paragraph boundaries", () => {
      const paragraph1 =
        "Recipe 1\nIngredients:\n- 1 cup flour\nInstructions:\nBake.";
      const paragraph2 =
        "Recipe 2\nIngredients:\n- 2 cups sugar\nInstructions:\nMix.";
      const text = `${paragraph1}\n\n${paragraph2}`;

      const chunks = chunkText(text, paragraph1.length + 5);
      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toBe(paragraph1);
      expect(chunks[1]).toBe(paragraph2);
    });
  });

  describe("parseBulkRecipes", () => {
    it("should parse text by delegating to getOpenAIModel and return accumulated recipes", async () => {
      const text = "Pasta and Sauce recipe book\n\nSome introductory text.";
      const recipes = await parseBulkRecipes(text);
      expect(recipes).toBeInstanceOf(Array);
      expect(recipes.length).toBeGreaterThan(0);
      expect(recipes[0].title).toBe("MSW Mock Bulk Pasta");
      expect(recipes[1].title).toBe("MSW Mock Bulk Sauce");
    });
  });
});
