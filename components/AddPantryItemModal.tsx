"use client";

import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Autocomplete } from "./ui/Autocomplete";
import { USDAFood, PantryLocation } from "@/types";
import { getLocationsAction } from "@/app/dashboard/pantry/location-actions";
import ManageLocationsModal from "./ManageLocationsModal";

interface AddPantryItemModalProps {
  onClose: () => void;
  onAdd: (data: {
    ingredient: USDAFood;
    quantity: number;
    unit: string;
    locationId?: string;
    restockThreshold: number;
    packageQuantity?: number;
    packageSize?: number;
  }) => Promise<void>;
}

export default function AddPantryItemModal({
  onClose,
  onAdd,
}: AddPantryItemModalProps) {
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("g");
  const [locationId, setLocationId] = useState("");
  const [threshold, setThreshold] = useState("0");
  const [packageQty, setPackageQty] = useState("1");
  const [packageSize, setPackageSize] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [locations, setLocations] = useState<PantryLocation[]>([]);
  const [showManageLocations, setShowManageLocations] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      const res = await getLocationsAction();
      if (res.success && res.data) {
        setLocations(res.data);
      }
    };

    fetchLocations();
  }, []);

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
        locationId: locationId || undefined,
        restockThreshold: parseFloat(threshold),
        packageQuantity: parseFloat(packageQty) || 1,
        packageSize: packageSize ? parseFloat(packageSize) : undefined,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showManageLocations) {
    return (
      <ManageLocationsModal
        onClose={async () => {
          setShowManageLocations(false);
          const res = await getLocationsAction();
          if (res.success && res.data) {
            setLocations(res.data);
          }
        }}
      />
    );
  }

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

        <div className="border-t border-zinc-800 pt-4 mt-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
            Format & Quantity
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Packages"
              type="number"
              step="any"
              value={packageQty}
              onChange={(e) => setPackageQty(e.target.value)}
              placeholder="e.g. 12"
            />
            <Input
              label="Size per Package"
              type="number"
              step="any"
              value={packageSize}
              onChange={(e) => setPackageSize(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 italic">
            Example: 12 (Packages) x 12 (Size) = 144 Total units.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total Quantity"
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
              { label: "Each (ea)", value: "ea" },
            ]}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-400">
            Location
          </label>
          <div className="flex gap-2">
            <Select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="flex-1"
            >
              <option value="">Uncategorized</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </Select>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowManageLocations(true)}
            >
              Manage
            </Button>
          </div>
        </div>

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
