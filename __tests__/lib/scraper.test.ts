import { describe, it, expect, vi, beforeEach } from "vitest";
import { scrapeRecipe } from "@/lib/scraper";

vi.mock("ai", () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: {
      ingredients: [
        { quantity: 200, unit: "g", name: "Pasta", prepState: "dry" },
        { quantity: 1, unit: "cup", name: "Sauce", prepState: "warm" },
      ],
    },
  }),
}));

describe("Recipe Scraper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract recipe data from valid JSON-LD", async () => {
    const mockHtml = `
      <html>
        <body>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "Recipe",
              "name": "Scraped Pasta",
              "recipeYield": "4 servings",
              "recipeIngredient": ["Pasta", "Sauce"],
              "recipeInstructions": [
                { "@type": "HowToStep", "text": "Boil water" },
                { "@type": "HowToStep", "text": "Cook pasta" }
              ]
            }
          </script>
        </body>
      </html>
    `;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const result = await scrapeRecipe("https://example.com/pasta");

    expect(result.title).toBe("Scraped Pasta");
    expect(result.yieldAmount).toBe(4);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].instruction).toBe("Boil water");
    expect(result.components).toHaveLength(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result.components[0] as any).ingredient.name).toBe("Pasta");
  });

  it("should handle nested @graph JSON-LD", async () => {
    const mockHtml = `
      <html>
        <body>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Recipe",
                  "name": "Graph Pasta",
                  "recipeIngredient": ["Item 1"]
                }
              ]
            }
          </script>
        </body>
      </html>
    `;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const result = await scrapeRecipe("https://example.com/pasta");
    expect(result.title).toBe("Graph Pasta");
  });

  it("should throw error if no recipe is found", async () => {
    const mockHtml = `<html><body></body></html>`;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    await expect(scrapeRecipe("https://example.com/nothing")).rejects.toThrow(
      "No recipe metadata (JSON-LD) found on this page.",
    );
  });
});
