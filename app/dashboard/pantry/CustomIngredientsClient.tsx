"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import CustomIngredientModal from "@/components/CustomIngredientModal";
import { deleteCustomIngredientAction } from "@/app/recipes/ingredient-actions";
import { USDAFood } from "@/types";

interface CustomIngredientsClientProps {
  ingredients: {
    id: string;
    name: string;
    baseAmount: number;
    baseMacros: unknown;
    foodPortions: unknown;
  }[];
}

export default function CustomIngredientsClient({
  ingredients,
}: CustomIngredientsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<
    Partial<USDAFood> | undefined
  >(undefined);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleEdit = (ing: CustomIngredientsClientProps["ingredients"][0]) => {
    const macros = (ing.baseMacros as Record<string, number>) || {};
    const food: Partial<USDAFood> = {
      fdcId: ing.id,
      description: ing.name,
      baseAmount: ing.baseAmount,
      foodPortions: ing.foodPortions as USDAFood["foodPortions"],
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
    setEditingIngredient(food);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this custom ingredient?")) {
      setIsDeleting(id);
      const res = await deleteCustomIngredientAction(id);
      if (!res.success) {
        alert(res.error);
      }
      setIsDeleting(null);
    }
  };

  return (
    <div className="mt-16 space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-2xl font-bold">My Custom Ingredients</h2>
        <Button
          onClick={() => {
            setEditingIngredient(undefined);
            setModalOpen(true);
          }}
        >
          Create New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredients.map((ing) => {
          const macros = (ing.baseMacros as Record<string, number>) || {};
          const portions = ing.foodPortions as Record<
            string,
            string | number
          >[];
          const unit = portions?.[0]?.measureUnitName || "g";
          return (
            <Card key={ing.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{ing.name}</h3>
                  <div className="text-zinc-400 text-sm">
                    Per {ing.baseAmount} {unit}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(ing)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => handleDelete(ing.id)}
                    disabled={isDeleting === ing.id}
                  >
                    {isDeleting === ing.id ? "..." : "Delete"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-zinc-900 rounded p-2 border border-zinc-800">
                <div>
                  <div className="text-zinc-500">Cal</div>
                  <div className="font-mono text-zinc-300">
                    {macros.calories || 0}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Pro</div>
                  <div className="font-mono text-zinc-300">
                    {macros.protein || 0}g
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Fat</div>
                  <div className="font-mono text-zinc-300">
                    {macros.fat || 0}g
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Carb</div>
                  <div className="font-mono text-zinc-300">
                    {macros.carbs || 0}g
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {ingredients.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800">
            You haven&apos;t created any custom ingredients yet.
          </div>
        )}
      </div>

      {modalOpen && (
        <CustomIngredientModal
          initialData={editingIngredient}
          onClose={() => setModalOpen(false)}
          onSaved={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
