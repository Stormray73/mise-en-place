type UnitCategory = "mass" | "volume" | "count";

interface UnitInfo {
  name: string;
  category: UnitCategory;
  baseRatio: number; // Ratio to base unit (g for mass, ml for volume, 1 for count)
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
  // Count (Base: 1)
  item: { name: "item", category: "count", baseRatio: 1 },
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

const ITEM_KEYWORDS = ["medium", "whole", "each", "piece", "large", "small"];

export function getWholeItemPortion(portions: USDAFoodPortion[]) {
  return portions.find((p) => {
    const mod = p.modifier.toLowerCase();
    const unit = p.measureUnitName.toLowerCase();
    return ITEM_KEYWORDS.some((k) => mod.includes(k) || unit.includes(k));
  });
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

  // Cross-category conversion requires density/portion data
  if (!portions || portions.length === 0) return false;

  // Mass <-> Volume
  if (
    (fromUnit.category === "mass" && toUnit.category === "volume") ||
    (fromUnit.category === "volume" && toUnit.category === "mass")
  ) {
    return portions.some(
      (p) => UNITS[p.measureUnitName]?.category === "volume",
    );
  }

  // Mass <-> Count
  if (
    (fromUnit.category === "mass" && toUnit.category === "count") ||
    (fromUnit.category === "count" && toUnit.category === "mass")
  ) {
    return !!getWholeItemPortion(portions);
  }

  return false;
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

  // Mass <-> Volume
  if (
    (fromUnit.category === "mass" && toUnit.category === "volume") ||
    (fromUnit.category === "volume" && toUnit.category === "mass")
  ) {
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
    } else {
      // Mass -> g -> ml -> Volume
      const valueG = value * fromUnit.baseRatio;
      const valueMl = valueG / density;
      return valueMl / toUnit.baseRatio;
    }
  }

  // Mass <-> Count
  if (
    (fromUnit.category === "mass" && toUnit.category === "count") ||
    (fromUnit.category === "count" && toUnit.category === "mass")
  ) {
    const itemPortion = getWholeItemPortion(portions);
    if (!itemPortion) {
      throw new Error(
        `Incompatible units: no item weight data available for ${from} to ${to}`,
      );
    }

    // itemWeight is grams per item
    const itemWeight = itemPortion.gramWeight / itemPortion.amount;

    if (fromUnit.category === "count" && toUnit.category === "mass") {
      // Count -> items -> g -> Mass
      const items = value * fromUnit.baseRatio;
      const valueG = items * itemWeight;
      return valueG / toUnit.baseRatio;
    } else {
      // Mass -> g -> items -> Count
      const valueG = value * fromUnit.baseRatio;
      const items = valueG / itemWeight;
      return items / toUnit.baseRatio;
    }
  }

  throw new Error(`Incompatible units: cannot convert ${from} to ${to}`);
}
