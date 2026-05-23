/**
 * @file AddMealModal.tsx
 * @responsibility Modal for adding a new meal slot to a specific date and seamlessly adding the first recipe.
 * @dependencies Modal, Button, Input, React
 */

import React, { useState, useTransition } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const DEFAULT_SLOTS = ["Breakfast", "Lunch", "Dinner"];

interface RecipeOption {
  id: string;
  title: string;
}

interface AddMealResult {
  success: boolean;
  mealId?: string;
  error?: string;
}

interface AddMealModalProps {
  date: Date;
  allRecipes: RecipeOption[];
  onClose: () => void;
  onAddMeal: (date: Date, slot: string) => Promise<AddMealResult>;
  onAddRecipe: (mealId: string, recipeId: string) => Promise<void>;
}

export default function AddMealModal({
  date,
  allRecipes,
  onClose,
  onAddMeal,
  onAddRecipe,
}: AddMealModalProps) {
  const [stage, setStage] = useState<"slot" | "recipe">("slot");
  const [createdMealId, setCreatedMealId] = useState<string>("");
  const [customSlot, setCustomSlot] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSelectSlot = (slot: string) => {
    startTransition(async () => {
      const res = await onAddMeal(date, slot);
      if (res.success && res.mealId) {
        setCreatedMealId(res.mealId);
        setStage("recipe");
      } else {
        alert(res.error || "Failed to create meal slot.");
      }
    });
  };

  const handleSelectRecipe = (recipeId: string) => {
    startTransition(async () => {
      await onAddRecipe(createdMealId, recipeId);
      onClose();
    });
  };

  const filteredRecipes = allRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (stage === "recipe") {
    return (
      <Modal title="Add Recipe to Meal" onClose={onClose}>
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">
            Select the first recipe to add to your newly created meal.
          </p>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            className="text-sm bg-zinc-850 border-zinc-700 text-zinc-200 w-full"
            disabled={isPending}
            autoFocus
          />
          <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2">
            {filteredRecipes.map((recipe) => (
              <Button
                key={recipe.id}
                onClick={() => handleSelectRecipe(recipe.id)}
                variant="ghost"
                className="w-full text-left justify-start p-4 hover:bg-zinc-800 transition-colors"
                disabled={isPending}
              >
                {isPending ? "Adding..." : recipe.title}
              </Button>
            ))}
            {filteredRecipes.length === 0 && (
              <p className="text-zinc-500 text-center py-4">
                No recipes found.
              </p>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Add Meal Slot" onClose={onClose}>
      <p className="text-zinc-400 text-sm mb-6">
        {date.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })}
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {DEFAULT_SLOTS.map((slot) => (
          <Button
            key={slot}
            onClick={() => handleSelectSlot(slot)}
            variant="ghost"
            className="py-6 text-lg"
            disabled={isPending}
          >
            {isPending ? "Adding..." : slot}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={customSlot}
          onChange={(e) => setCustomSlot(e.target.value)}
          placeholder="Custom Slot..."
          disabled={isPending}
        />
        <Button
          onClick={() => handleSelectSlot(customSlot)}
          disabled={!customSlot || isPending}
        >
          {isPending ? "Adding..." : "Add"}
        </Button>
      </div>
    </Modal>
  );
}
