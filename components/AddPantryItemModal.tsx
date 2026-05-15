"use client";

import React, { useState } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Autocomplete } from "./ui/Autocomplete";
import { USDAFood } from "@/types";

interface AddPantryItemModalProps {
  onClose: () => void;
  onAdd: (data: {
    ingredient: USDAFood;
    quantity: number;
    unit: string;
    locationTags: string[];
    restockThreshold: number;
  }) => Promise<void>;
}

export default function AddPantryItemModal({
  onClose,
  onAdd,
}: AddPantryItemModalProps) {
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("g");
  const [location, setLocation] = useState("");
  const [threshold, setThreshold] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchUSDA = async (query: string) => {
    const res = await fetch(`/api/usda/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.foods || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        ingredient: selectedFood,
        quantity: parseFloat(quantity),
        unit,
        locationTags: location ? [location] : [],
        restockThreshold: parseFloat(threshold),
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Add Pantry Item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Autocomplete<USDAFood>
          label="Ingredient"
          placeholder="Search USDA..."
          onSearch={searchUSDA}
          onSelect={setSelectedFood}
          minChars={3}
          keyExtractor={(food) => food.fdcId.toString()}
          renderItem={(food) => (
            <>
              <div className="font-medium">{food.description}</div>
              <div className="text-xs text-zinc-400">{food.foodCategory}</div>
            </>
          )}
        />

        {selectedFood && (
          <div className="text-sm text-zinc-400">
            Selected: {selectedFood.description}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <Select
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            options={[
              { label: "Gram (g)", value: "g" },
              { label: "Kilogram (kg)", value: "kg" },
              { label: "Ounce (oz)", value: "oz" },
              { label: "Pound (lb)", value: "lb" },
              { label: "Milliliter (ml)", value: "ml" },
              { label: "Liter (L)", value: "L" },
              { label: "Cup", value: "cup" },
              { label: "Tablespoon (tbsp)", value: "tbsp" },
              { label: "Teaspoon (tsp)", value: "tsp" },
            ]}
          />
        </div>

        <Input
          label="Location (e.g., Fridge, Pantry)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Main Pantry"
        />

        <Input
          label="Restock Threshold"
          type="number"
          step="any"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="0"
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedFood || isSubmitting}>
            {isSubmitting ? "Adding..." : "Add to Pantry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
