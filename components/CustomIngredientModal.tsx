"use client";

import React, { useState } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { saveCustomIngredientAction } from "@/app/recipes/ingredient-actions";
import { USDAFood } from "@/types";

interface CustomIngredientModalProps {
  onClose: () => void;
  onSaved: (ingredient: USDAFood) => void;
  initialData?: Partial<USDAFood>;
  initialQuery?: string;
}

export default function CustomIngredientModal({
  onClose,
  onSaved,
  initialData,
  initialQuery,
}: CustomIngredientModalProps) {
  const isEditing = !!initialData?.fdcId;

  const [name, setName] = useState(
    initialData?.description || initialQuery || "",
  );
  const [baseAmount, setBaseAmount] = useState(
    initialData?.baseAmount?.toString() || "100",
  );

  // Try to find the unit from foodPortions if it exists
  const initialUnit = initialData?.foodPortions?.[0]?.measureUnitName || "g";
  const [unit, setUnit] = useState(initialUnit);

  const getMacro = (name: string) =>
    initialData?.foodNutrients
      ?.find((n) => n.nutrientName.toLowerCase().includes(name.toLowerCase()))
      ?.value?.toString() || "0";

  const [calories, setCalories] = useState(getMacro("energy"));
  const [protein, setProtein] = useState(getMacro("protein"));
  const [fat, setFat] = useState(getMacro("lipid"));
  const [carbs, setCarbs] = useState(getMacro("carbohydrate"));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const macros = {
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      fat: parseFloat(fat) || 0,
      carbs: parseFloat(carbs) || 0,
    };

    try {
      const res = await saveCustomIngredientAction({
        id: isEditing ? (initialData.fdcId as string) : undefined,
        name,
        baseAmount: parseFloat(baseAmount),
        unit,
        macros,
      });

      if (res.success && res.data) {
        // Return a mock USDAFood object for immediate UI updates
        const savedFood: USDAFood = {
          fdcId: res.data.id,
          description: name,
          foodCategory: "Custom Ingredient",
          userId: "current-user", // Simplified for UI
          baseAmount: parseFloat(baseAmount),
          foodPortions: [
            {
              amount: parseFloat(baseAmount),
              measureUnitName: unit,
              modifier: "",
              gramWeight: parseFloat(baseAmount),
            },
          ],
          foodNutrients: [
            { nutrientName: "Energy", value: macros.calories },
            { nutrientName: "Protein", value: macros.protein },
            { nutrientName: "Total lipid (fat)", value: macros.fat },
            {
              nutrientName: "Carbohydrate, by difference",
              value: macros.carbs,
            },
          ],
        };
        onSaved(savedFood);
        onClose();
      } else if (!res.success) {
        setError(res.error || "Failed to save custom ingredient");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Custom Ingredient" : "Add Custom Ingredient"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-500 text-sm bg-red-950/20 p-3 rounded-md">
            {error}
          </div>
        )}

        <Input
          label="Ingredient Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Base Amount"
            type="number"
            step="any"
            min="0.1"
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
            required
          />
          <Select
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            options={[
              { label: "Gram (g)", value: "g" },
              { label: "Milliliter (ml)", value: "ml" },
              { label: "Ounce (oz)", value: "oz" },
              { label: "Fluid Ounce (fl oz)", value: "fl oz" },
              { label: "Piece/Whole", value: "piece" },
            ]}
          />
        </div>

        <div className="border-t border-zinc-800 pt-4 mt-2">
          <h3 className="text-sm font-medium mb-3 text-zinc-300">
            Macros (per {baseAmount} {unit})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Calories"
              type="number"
              step="any"
              min="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <Input
              label="Protein (g)"
              type="number"
              step="any"
              min="0"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <Input
              label="Fat (g)"
              type="number"
              step="any"
              min="0"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
            />
            <Input
              label="Carbs (g)"
              type="number"
              step="any"
              min="0"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "Saving..." : "Save Ingredient"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
