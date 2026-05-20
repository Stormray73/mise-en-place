"use client";

import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { PantryLocation } from "@/types";
import { getLocationsAction } from "@/app/dashboard/pantry/location-actions";
import ManageLocationsModal from "./ManageLocationsModal";

interface EditPantryItemModalProps {
  onClose: () => void;
  onUpdate: (
    itemId: string,
    data: {
      quantity: number;
      unit: string;
      locationId?: string;
      restockThreshold: number;
      packageQuantity?: number;
      packageSize?: number;
    }
  ) => Promise<void>;
  item: {
    id: string;
    quantity: number;
    unit: string;
    locationId?: string | null;
    restockThreshold: number;
    packageQuantity?: number | null;
    packageSize?: number | null;
    ingredient: {
      name: string;
    };
  };
}

export default function EditPantryItemModal({
  onClose,
  onUpdate,
  item,
}: EditPantryItemModalProps) {
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [unit, setUnit] = useState(item.unit);
  const [locationId, setLocationId] = useState(item.locationId || "");
  const [threshold, setThreshold] = useState(item.restockThreshold.toString());
  const [packageQty, setPackageQty] = useState(
    item.packageQuantity?.toString() || "1"
  );
  const [packageSize, setPackageSize] = useState(
    item.packageSize?.toString() || ""
  );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(item.id, {
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
    <Modal title={`Edit ${item.ingredient.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
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
              { label: "Item", value: "item" },
            ]}
          />
        </div>

        <div className="flex gap-2 items-end">
          <Select
            label="Location"
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
            className="mb-[2px]"
          >
            Manage
          </Button>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
