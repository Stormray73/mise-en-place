type UnitCategory = "mass" | "volume";

interface UnitInfo {
  name: string;
  category: UnitCategory;
  baseRatio: number; // Ratio to base unit (g for mass, ml for volume)
}

const UNITS: Record<string, UnitInfo> = {
  // Mass (Base: g)
  mg: { name: "milligram", category: "mass", baseRatio: 0.001 },
  g: { name: "gram", category: "mass", baseRatio: 1 },
  kg: { name: "kilogram", category: "mass", baseRatio: 1000 },
  oz: { name: "ounce", category: "mass", baseRatio: 28.349523125 },
  lb: { name: "pound", category: "mass", baseRatio: 453.59237 },
  // Volume (Base: ml)
  ml: { name: "milliliter", category: "volume", baseRatio: 1 },
  cl: { name: "centiliter", category: "volume", baseRatio: 10 },
  L: { name: "liter", category: "volume", baseRatio: 1000 },
  tsp: { name: "teaspoon", category: "volume", baseRatio: 4.92892159375 },
  tbsp: { name: "tablespoon", category: "volume", baseRatio: 14.78676478125 },
  "fl oz": {
    name: "fluid ounce",
    category: "volume",
    baseRatio: 29.5735295625,
  },
  cup: { name: "cup", category: "volume", baseRatio: 236.5882365 },
  pt: { name: "pint", category: "volume", baseRatio: 473.176473 },
  qt: { name: "quart", category: "volume", baseRatio: 946.352946 },
  gal: { name: "gallon", category: "volume", baseRatio: 3785.411784 },
};

export interface USDAFoodPortion {
  gramWeight: number;
  modifier: string;
  amount: number;
  measureUnitName: string;
}

export function getUnits() {
  return Object.keys(UNITS);
}

export function canConvert(
  from: string,
  to: string,
  portions?: USDAFoodPortion[],
): boolean {
  const fromUnit = UNITS[from];
  const toUnit = UNITS[to];
  if (!fromUnit || !toUnit) return false;
  if (fromUnit.category === toUnit.category) return true;

  // Cross-category conversion requires density data (portions)
  if (!portions || portions.length === 0) return false;

  // We check if any portion provides a link between mass and volume
  // In USDA data, gramWeight is always mass (g).
  // measureUnitName is usually the volume unit or a common unit (e.g., 'cup', 'tbsp', 'piece').
  // If measureUnitName matches one of our volume units, we can convert.
  return portions.some((p) => UNITS[p.measureUnitName]?.category === "volume");
}

export function convert(
  value: number,
  from: string,
  to: string,
  portions?: USDAFoodPortion[],
): number {
  if (from === to) return value;

  const fromUnit = UNITS[from];
  const toUnit = UNITS[to];

  if (!fromUnit) throw new Error(`Unknown unit: ${from}`);
  if (!toUnit) throw new Error(`Unknown unit: ${to}`);

  if (fromUnit.category === toUnit.category) {
    const valueInBase = value * fromUnit.baseRatio;
    return valueInBase / toUnit.baseRatio;
  }

  // Cross-category conversion
  if (!portions || portions.length === 0) {
    throw new Error(`Incompatible units: cannot convert ${from} to ${to}`);
  }

  // Find a portion that uses a volume unit we know
  const volumePortion = portions.find(
    (p) => UNITS[p.measureUnitName]?.category === "volume",
  );

  if (!volumePortion) {
    throw new Error(
      `Incompatible units: no density data available for ${from} to ${to}`,
    );
  }

  // gramWeight is the mass in grams for 'amount' of 'measureUnitName'
  // Density = (gramWeight) / (amount * measureUnitName.baseRatio)  [g/ml]
  const portionVolumeMl =
    volumePortion.amount * UNITS[volumePortion.measureUnitName].baseRatio;
  const density = volumePortion.gramWeight / portionVolumeMl; // g/ml

  if (fromUnit.category === "volume" && toUnit.category === "mass") {
    // Volume -> ml -> g -> Mass
    const valueMl = value * fromUnit.baseRatio;
    const valueG = valueMl * density;
    return valueG / toUnit.baseRatio;
  } else if (fromUnit.category === "mass" && toUnit.category === "volume") {
    // Mass -> g -> ml -> Volume
    const valueG = value * fromUnit.baseRatio;
    const valueMl = valueG / density;
    return valueMl / toUnit.baseRatio;
  }

  throw new Error(`Incompatible units: cannot convert ${from} to ${to}`);
}
