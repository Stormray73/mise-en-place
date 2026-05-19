import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { JsonValue } from "@prisma/client/runtime/library";

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

    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "USDA API key not configured" },
        { status: 500 },
      );
    }

    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data from USDA: ${response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    data.foods = [...customIngredients, ...(data.foods || [])];
    return NextResponse.json(data);
  } catch (error) {
    console.error("USDA Proxy Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
