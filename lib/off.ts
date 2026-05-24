export interface OFFProduct {
  code?: string;
  _id?: string;
  product_name?: string;
  product_name_en?: string;
  serving_size?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal"?: number;
    proteins_100g?: number;
    proteins?: number;
    fat_100g?: number;
    fat?: number;
    carbohydrates_100g?: number;
    carbohydrates?: number;
  };
}

export interface OFFNormalizedFood {
  fdcId: string;
  description: string;
  foodCategory: string;
  source: "OFF";
  baseAmount: number;
  foodPortions: Array<{
    modifier: string;
    gramWeight: number;
    amount: number;
  }>;
  foodNutrients: Array<{
    nutrientName: string;
    value: number;
  }>;
}

function parseServingSizeToGrams(servingSize: string): number {
  if (!servingSize) return 100;
  const match = servingSize.match(/(\d+(?:\.\d+)?)\s*(g|ml)/i);
  if (match) {
    return parseFloat(match[1]);
  }
  return 100;
}

export async function searchOpenFoodFacts(
  query: string,
): Promise<OFFNormalizedFood[]> {
  if (process.env.ENABLE_MSW === "true") {
    return [
      {
        fdcId: "off-mock-123",
        description: "Mock Branded Item",
        foodCategory: "Branded / Open Food Facts",
        source: "OFF",
        baseAmount: 100,
        foodPortions: [
          {
            modifier: "1 serving",
            gramWeight: 100,
            amount: 1,
          },
        ],
        foodNutrients: [
          { nutrientName: "Energy", value: 150 },
          { nutrientName: "Protein", value: 5 },
          { nutrientName: "Total lipid (fat)", value: 2 },
          { nutrientName: "Carbohydrate, by difference", value: 30 },
        ],
      },
    ];
  }

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query,
    )}&search_simple=1&action=process&json=1&page_size=10`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "MiseEnPlace/1.0 (contact@miseenplace.app)",
      },
    });

    if (!res.ok) {
      console.error("Open Food Facts search failed:", res.statusText);
      return [];
    }

    const data = await res.json();
    const products: OFFProduct[] = data.products || [];

    return products.map((product) => {
      const id =
        product.code || product._id || Math.random().toString(36).substring(7);
      const name =
        product.product_name ||
        product.product_name_en ||
        "Unknown OFF Product";
      const servingSize = product.serving_size || "";
      const kcal = Number(
        product.nutriments?.["energy-kcal_100g"] ??
          product.nutriments?.["energy-kcal"] ??
          0,
      );
      const protein = Number(
        product.nutriments?.proteins_100g ?? product.nutriments?.proteins ?? 0,
      );
      const fat = Number(
        product.nutriments?.fat_100g ?? product.nutriments?.fat ?? 0,
      );
      const carbs = Number(
        product.nutriments?.carbohydrates_100g ??
          product.nutriments?.carbohydrates ??
          0,
      );

      const portions = servingSize
        ? [
            {
              modifier: servingSize,
              gramWeight: parseServingSizeToGrams(servingSize),
              amount: 1,
            },
          ]
        : [];

      return {
        fdcId: `off-${id}`,
        description: name,
        foodCategory: "Branded / Open Food Facts",
        source: "OFF",
        baseAmount: 100,
        foodPortions: portions,
        foodNutrients: [
          { nutrientName: "Energy", value: kcal },
          { nutrientName: "Protein", value: protein },
          { nutrientName: "Total lipid (fat)", value: fat },
          { nutrientName: "Carbohydrate, by difference", value: carbs },
        ],
      };
    });
  } catch (error) {
    console.error("Open Food Facts fetch error:", error);
    return [];
  }
}
