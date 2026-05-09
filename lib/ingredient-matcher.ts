import { RecipeComponent } from "@/types";

/**
 * Matches instruction text against a list of recipe components to find relevant ingredients.
 * Handles shorthand by checking if the base name exists in the instruction.
 *
 * Example:
 *   Instruction: "Add the milk"
 *   Components: [{ name: "Evaporated Milk" }, { name: "Salt" }]
 *   Result: [{ name: "Evaporated Milk" }]
 */
export function getRelevantIngredients(
  instruction: string,
  components: RecipeComponent[],
) {
  if (!instruction) return [];

  const lowerInstruction = instruction.toLowerCase();

  return components.filter((comp) => {
    const name = (
      comp.ingredient?.name ||
      comp.childRecipe?.title ||
      ""
    ).toLowerCase();

    // 1. Direct match (Full name contained in instruction)
    if (lowerInstruction.includes(name)) return true;

    // 2. Shorthand/Partial match
    // Split the name into significant words (ignore common ones like 'of', 'and', etc.)
    const stopWords = [
      "of",
      "and",
      "the",
      "ripe",
      "raw",
      "fresh",
      "dried",
      "ground",
      "powder",
    ];
    const significantWords = name
      .split(/[\s,]+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word));

    // If any significant word from the ingredient name is mentioned in the instruction,
    // we consider it a match (assuming it's not ambiguous).
    const matchesWord = significantWords.some((word) =>
      lowerInstruction.includes(word),
    );

    return matchesWord;
  });
}
