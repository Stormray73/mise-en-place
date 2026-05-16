"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import AddPantryItemModal from "@/components/AddPantryItemModal";
import {
  addToPantryAction,
  decrementPantryItemAction,
  deletePantryItemAction,
} from "./actions";

interface PantryItem {
  id: string;
  quantity: number;
  unit: string;
  locationId?: string | null;
  location?: {
    name: string;
  } | null;
  restockThreshold: number;
  packageQuantity?: number | null;
  packageSize?: number | null;
  ingredient: {
    name: string;
  };
}

interface PantryClientProps {
  initialPantry: PantryItem[];
}

export default function PantryClient({ initialPantry }: PantryClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const filteredPantry = initialPantry.filter(
    (item) => showEmpty || item.quantity > 0,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Button onClick={() => setShowAddModal(true)}>Add Item</Button>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showEmpty}
              onChange={(e) => setShowEmpty(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800"
            />
            Show zero-stock items
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPantry.map((item) => (
          <Card key={item.id} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{item.ingredient.name}</h3>
                <div className="text-zinc-400 text-sm">
                  {item.location?.name || "Uncategorized"}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-400"
                onClick={() => deletePantryItemAction(item.id)}
              >
                Delete
              </Button>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div
                  className={`text-2xl font-mono font-bold ${
                    item.quantity <= item.restockThreshold
                      ? "text-orange-500"
                      : "text-green-500"
                  }`}
                >
                  {item.quantity} {item.unit}
                </div>
                {item.packageQuantity && item.packageSize && (
                  <div className="text-xs text-zinc-400 font-medium">
                    {item.packageQuantity.toFixed(1)} x {item.packageSize}{" "}
                    {item.unit} (Packages)
                  </div>
                )}
                <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                  Threshold: {item.restockThreshold} {item.unit}
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => decrementPantryItemAction(item.id, 1)}
                  disabled={item.quantity <= 0}
                >
                  -1
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    decrementPantryItemAction(item.id, item.quantity)
                  }
                  disabled={item.quantity <= 0}
                >
                  Finish
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredPantry.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800">
            No items found in your pantry.
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPantryItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={addToPantryAction}
        />
      )}
    </div>
  );
}
