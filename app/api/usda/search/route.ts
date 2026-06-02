import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { JsonValue } from "@prisma/client/runtime/library";
import { searchOpenFoodFacts, OFFNormalizedFood } from "@/lib/off";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id;

    let customIngredients: Record<string, unknown>[] = [];
    if (userId) {
      const customIngs = await prisma.ingredient.findMany({
        where: {
          userId,
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 10,
      });

      customIngredients = customIngs.map((ing) => {
        const macros = (ing.baseMacros as Record<string, number>) || {};
        return {
          fdcId: ing.id,
          description: ing.name,
          foodCategory: "Custom Ingredient",
          userId: ing.userId,
          baseAmount: ing.baseAmount,
          foodPortions: (ing.foodPortions as JsonValue) || [],
          source: "Local",
          foodNutrients: [
            { nutrientName: "Energy", value: macros.calories || 0 },
            { nutrientName: "Protein", value: macros.protein || 0 },
            { nutrientName: "Total lipid (fat)", value: macros.fat || 0 },
            {
              nutrientName: "Carbohydrate, by difference",
              value: macros.carbs || 0,
            },
          ],
        };
      });
    }

    const branded = searchParams.get("branded") === "true";
    const apiKey = process.env.USDA_API_KEY;
    let usdaFoods: (Record<string, unknown> | OFFNormalizedFood)[] = [];
    let offFoods: OFFNormalizedFood[] = [];

    if (process.env.ENABLE_MSW === "true") {
      usdaFoods = [
        {
          fdcId: 1103332,
          description: "Tomatoes, red, ripe, raw, year round average",
          foodCategory: "Vegetables and Vegetable Products",
          source: "USDA",
          foodNutrients: [
            { nutrientName: "Energy", value: 18 },
            { nutrientName: "Protein", value: 0.88 },
            { nutrientName: "Total lipid (fat)", value: 0.2 },
            { nutrientName: "Carbohydrate, by difference", value: 3.89 },
          ],
        },
        {
          fdcId: 1103333,
          description: "Salt, table",
          foodCategory: "Spices and Herbs",
          source: "USDA",
          foodNutrients: [],
        },
      ];
      offFoods = await searchOpenFoodFacts(query);
    } else {
      const promises: Promise<void>[] = [];

      if (!branded && apiKey) {
        promises.push(
          (async () => {
            try {
              const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
              const response = await fetch(url);
              if (response.ok) {
                const data = await response.json();
                usdaFoods = (data.foods || []).map(
                  (food: Record<string, unknown>) => ({
                    ...food,
                    source: "USDA",
                  }),
                );
              }
            } catch (err) {
              console.error("USDA fetch failed:", err);
            }
          })(),
        );
      }

      promises.push(
        (async () => {
          try {
            offFoods = await searchOpenFoodFacts(query);
          } catch (err) {
            console.error("Open Food Facts search failed:", err);
          }
        })(),
      );

      await Promise.all(promises);
    }

    const foods = [...customIngredients, ...usdaFoods, ...offFoods];
    return NextResponse.json({ foods });
  } catch (error) {
    console.error("Ingredient Search Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
