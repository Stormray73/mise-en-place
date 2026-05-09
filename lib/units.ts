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

export function getUnits() {
  return Object.keys(UNITS);
}

export function canConvert(from: string, to: string): boolean {
  const fromUnit = UNITS[from];
  const toUnit = UNITS[to];
  if (!fromUnit || !toUnit) return false;
  return fromUnit.category === toUnit.category;
}

export function convert(value: number, from: string, to: string): number {
  if (from === to) return value;

  const fromUnit = UNITS[from];
  const toUnit = UNITS[to];

  if (!fromUnit) throw new Error(`Unknown unit: ${from}`);
  if (!toUnit) throw new Error(`Unknown unit: ${to}`);

  if (fromUnit.category !== toUnit.category) {
    throw new Error(`Incompatible units: cannot convert ${from} to ${to}`);
  }

  const valueInBase = value * fromUnit.baseRatio;
  return valueInBase / toUnit.baseRatio;
}
