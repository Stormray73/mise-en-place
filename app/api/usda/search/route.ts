import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
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

  let customFoods: Record<string, unknown>[] = [];
  if (userId) {
    const customIngredients = await prisma.ingredient.findMany({
      where: {
        userId,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 10,
    });

    customFoods = customIngredients.map((ing) => {
      const macros = (ing.baseMacros as Record<string, number>) || {};
      return {
        fdcId: ing.id,
        description: ing.name,
        foodCategory: "Custom Ingredient",
        userId: ing.userId,
        baseAmount: ing.baseAmount,
        foodPortions: ing.foodPortions || [],
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
  if (!apiKey || process.env.MOCK_AUTH === "true") {
    // Return mock data in test mode or if API key is missing
    if (process.env.MOCK_AUTH === "true") {
      const mockFoods = [
        {
          fdcId: 1103332,
          description: "Tomatoes, red, ripe, raw, year round average",
          foodCategory: "Vegetables and Vegetable Products",
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
          foodNutrients: [],
        },
      ];

      return NextResponse.json({
        foods: [
          ...customFoods,
          ...mockFoods.filter((f) =>
            f.description.toLowerCase().includes(query.toLowerCase()),
          ),
        ],
      });
    }

    return NextResponse.json(
      { error: "USDA API key not configured" },
      { status: 500 },
    );
  }

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data from USDA: ${response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    data.foods = [...customFoods, ...(data.foods || [])];
    return NextResponse.json(data);
  } catch (error) {
    console.error("USDA Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
