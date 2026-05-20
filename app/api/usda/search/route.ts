import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { JsonValue } from "@prisma/client/runtime/library";
import { searchOpenFoodFacts } from "@/lib/off";

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
    let usdaFoods: any[] = [];

    // Search USDA if not explicitly searching branded only, and USDA key is configured
    if (!branded && apiKey) {
      try {
        const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          usdaFoods = (data.foods || []).map((food: any) => ({
            ...food,
            source: "USDA",
          }));
        }
      } catch (err) {
        console.error("USDA fetch failed:", err);
      }
    }

    // Waterfall to Open Food Facts if USDA returned no results, or if specifically looking for branded items,
    // or if USDA API key is not configured.
    if (usdaFoods.length === 0 || branded) {
      try {
        const offFoods = await searchOpenFoodFacts(query);
        usdaFoods = offFoods; // already mapped with source: "OFF"
      } catch (err) {
        console.error("Open Food Facts search failed:", err);
      }
    }

    const foods = [...customIngredients, ...usdaFoods];
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

