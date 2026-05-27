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

const SHORTHAND_UNITS: Record<string, string> = {
  t: "tsp",
  tsp: "tsp",
  tsps: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  "t.": "tsp",
  "tsp.": "tsp",
  T: "tbsp",
  tbs: "tbsp",
  tbsp: "tbsp",
  tbsps: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  "T.": "tbsp",
  "tbsp.": "tbsp",
  c: "cup",
  cup: "cup",
  cups: "cup",
  "c.": "cup",
  oz: "oz",
  ozs: "oz",
  ounce: "oz",
  ounces: "oz",
  "oz.": "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  "lb.": "lb",
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "L",
  liter: "L",
  liters: "L",
  ea: "item",
  each: "item",
  item: "item",
  items: "item",
};

const UNICODE_FRACTIONS: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅐": 0.142,
  "⅑": 0.111,
  "⅒": 0.1,
  "⅓": 0.333,
  "⅔": 0.667,
  "⅕": 0.2,
  "⅖": 0.4,
  "⅗": 0.6,
  "⅘": 0.8,
  "⅙": 0.167,
  "⅚": 0.833,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

export function normalizeUnicodeFractions(str: string): string {
  let result = str;
  for (const [char, val] of Object.entries(UNICODE_FRACTIONS)) {
    result = result.replace(new RegExp(char, "g"), val.toString());
  }
  return result;
}

export function normalizeUnit(unit: string): string {
  if (unit === "T") return "tbsp";
  if (unit === "t") return "tsp";
  const clean = unit.trim().toLowerCase().replace(/\.$/, "");
  if (clean === "ea" || clean === "each") return "ea";
  return SHORTHAND_UNITS[clean] || clean;
}

export function parseUnicodeFractions(input: string): number {
  let text = input.trim();
  let total = 0;

  for (const [unicode, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (text.includes(unicode)) {
      text = text.replace(new RegExp(unicode, "g"), ` ${val} `);
    }
  }

  const tokens = text.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (token.includes("/")) {
      const parts = token.split("/");
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          total += num / den;
        }
      }
    } else {
      const val = parseFloat(token);
      if (!isNaN(val)) {
        total += val;
      }
    }
  }

  return total || 0;
}

export function normalizeUnitAndQuantity(
  rawQty: string | number,
  rawUnit: string,
): { quantity: number; unit: string } {
  let qtyStr = typeof rawQty === "number" ? rawQty.toString() : rawQty;
  let unitStr = rawUnit ? rawUnit.trim() : "";

  if (!qtyStr.trim()) {
    const match = unitStr.match(/^([\d¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞/\s.-]+)(.*)$/);
    if (match) {
      qtyStr = match[1];
      unitStr = match[2];
    }
  }

  const noSpaceMatch = qtyStr.match(
    /^([\d¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞/.-]+)([a-zA-Z.‌​]+)$/,
  );
  if (noSpaceMatch) {
    qtyStr = noSpaceMatch[1];
    unitStr = noSpaceMatch[2];
  }

  unitStr = unitStr.replace(/\.$/, "").trim();

  const quantity = parseUnicodeFractions(qtyStr);
  const mappedUnit =
    SHORTHAND_UNITS[unitStr] ||
    SHORTHAND_UNITS[unitStr.toLowerCase()] ||
    "item";

  return {
    quantity: quantity || 0,
    unit: mappedUnit,
  };
}

export function parseQuantityUnitAndName(
  qty: number,
  unit: string,
  name: string,
): { quantity: number; unit: string; name: string } {
  let finalQty = qty;
  let finalUnit = unit;
  let finalName = name;

  // 1. If unit contains starting number/fraction: e.g. "2T" or "¼ C"
  const unitMatch = unit
    .trim()
    .match(/^(\d+(?:\.\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*([a-zA-Z]+(?:\.)?)$/);
  if (unitMatch) {
    const qStr = unitMatch[1];
    if (UNICODE_FRACTIONS[qStr] !== undefined) {
      finalQty = UNICODE_FRACTIONS[qStr];
    } else {
      finalQty = parseFloat(qStr) || 1;
    }
    finalUnit = unitMatch[2];
  }

  // 2. If unit is empty/generic, or name starts with a quantity & unit (e.g. "2T flour", "½ cup flour", "6oz chicken", "1 1/2 tsp salt")
  const qtyUnitRegex =
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*([a-zA-Z]+(?:\.)?)\s+(.+)$/;
  const nameMatch = finalName.trim().match(qtyUnitRegex);
  if (nameMatch && (finalUnit === "ea" || finalUnit === "" || !finalUnit)) {
    let qStr = nameMatch[1];
    const uStr = nameMatch[2];
    const actualName = nameMatch[3];

    const normalizedU = normalizeUnit(uStr);
    if (
      UNITS[normalizedU] ||
      normalizedU === "tbsp" ||
      normalizedU === "tsp" ||
      normalizedU === "cup" ||
      normalizedU === "oz" ||
      normalizedU === "lb"
    ) {
      let parsedQty = 1;
      qStr = normalizeUnicodeFractions(qStr);
      if (qStr.includes("/")) {
        if (qStr.includes(" ")) {
          const parts = qStr.split(/\s+/);
          const whole = parseFloat(parts[0]) || 0;
          const fracParts = parts[1].split("/");
          const frac =
            (parseFloat(fracParts[0]) || 0) / (parseFloat(fracParts[1]) || 1);
          parsedQty = whole + frac;
        } else {
          const fracParts = qStr.split("/");
          parsedQty =
            (parseFloat(fracParts[0]) || 0) / (parseFloat(fracParts[1]) || 1);
        }
      } else {
        parsedQty = parseFloat(qStr) || 1;
      }

      finalQty = parsedQty;
      finalUnit = uStr;
      finalName = actualName;
    }
  }

  // 3. If name starts with just a number (e.g. "2 carrots"), and unit is generic
  const qtyOnlyRegex =
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s+(.+)$/;
  const qtyOnlyMatch = finalName.trim().match(qtyOnlyRegex);
  if (qtyOnlyMatch && (finalUnit === "ea" || finalUnit === "" || !finalUnit)) {
    let qStr = qtyOnlyMatch[1];
    const actualName = qtyOnlyMatch[2];

    let parsedQty = 1;
    qStr = normalizeUnicodeFractions(qStr);
    if (qStr.includes("/")) {
      if (qStr.includes(" ")) {
        const parts = qStr.split(/\s+/);
        const whole = parseFloat(parts[0]) || 0;
        const fracParts = parts[1].split("/");
        const frac =
          (parseFloat(fracParts[0]) || 0) / (parseFloat(fracParts[1]) || 1);
        parsedQty = whole + frac;
      } else {
        const fracParts = qStr.split("/");
        parsedQty =
          (parseFloat(fracParts[0]) || 0) / (parseFloat(fracParts[1]) || 1);
      }
    } else {
      parsedQty = parseFloat(qStr) || 1;
    }

    finalQty = parsedQty;
    finalUnit = "ea";
    finalName = actualName;
  }

  // 4. Handle unicode fraction in the finalUnit e.g., "¼ C"
  if (finalUnit) {
    const unicodeMatch = finalUnit
      .trim()
      .match(/^([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*([a-zA-Z]+(?:\.)?)$/);
    if (unicodeMatch) {
      finalQty = UNICODE_FRACTIONS[unicodeMatch[1]] || 1;
      finalUnit = unicodeMatch[2];
    }
  }

  // Final normalize of the unit
  finalUnit = normalizeUnit(finalUnit);

  return {
    quantity: finalQty,
    unit: finalUnit,
    name: finalName.trim(),
  };
}
