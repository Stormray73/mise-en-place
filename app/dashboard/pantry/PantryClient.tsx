"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import AddPantryItemModal from "@/components/AddPantryItemModal";
import EditPantryItemModal from "@/components/EditPantryItemModal";
import {
  addToPantryAction,
  deletePantryItemAction,
  updatePantryItemAction,
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
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  const filteredPantry = initialPantry.filter(
    (item) => showEmpty || item.quantity > 0,
  );

  const handleIncrement = async (item: PantryItem) => {
    await updatePantryItemAction(item.id, { quantity: item.quantity + 1 });
  };

  const handleDecrement = async (item: PantryItem) => {
    await updatePantryItemAction(item.id, {
      quantity: Math.max(0, item.quantity - 1),
    });
  };

  const toggleUsed = async (item: PantryItem) => {
    if (item.quantity > 0) {
      await updatePantryItemAction(item.id, { quantity: 0 });
    } else {
      await updatePantryItemAction(item.id, { quantity: 1 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Button onClick={() => setShowAddModal(true)}>Add Item</Button>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showEmpty}
              onChange={(e) => setShowEmpty(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 focus:ring-0 focus:ring-offset-0 text-blue-500"
            />
            Show zero-stock items
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPantry.map((item) => (
          <Card
            key={item.id}
            className={`p-4 space-y-4 border transition-all duration-200 ${
              item.quantity <= 0
                ? "border-zinc-800 bg-zinc-900/40 opacity-70"
                : item.quantity <= item.restockThreshold
                  ? "border-orange-500/30 shadow-sm shadow-orange-500/5 bg-zinc-900"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3
                  className={`font-bold text-lg leading-tight ${
                    item.quantity <= 0 ? "text-zinc-500 line-through" : "text-zinc-100"
                  }`}
                >
                  {item.ingredient.name}
                </h3>
                <div className="text-zinc-500 text-xs mt-0.5">
                  {item.location?.name || "Uncategorized"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingItem(item)}
                  className="p-1.5 text-zinc-400 hover:text-blue-400 rounded transition-colors"
                  title="Edit Item"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-2.036a5 5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to delete ${item.ingredient.name}?`
                      )
                    ) {
                      deletePantryItemAction(item.id);
                    }
                  }}
                  className="p-1.5 text-zinc-400 hover:text-red-500 rounded transition-colors"
                  title="Delete Item"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div
                  className={`text-2xl font-mono font-bold ${
                    item.quantity <= 0
                      ? "text-zinc-600"
                      : item.quantity <= item.restockThreshold
                        ? "text-orange-500"
                        : "text-green-500"
                  }`}
                >
                  {item.quantity} {item.unit}
                </div>
                {item.packageQuantity && item.packageSize && (
                  <div className="text-[10px] text-zinc-400 font-medium">
                    {item.packageQuantity.toFixed(1)} x {item.packageSize}{" "}
                    {item.unit} (Packages)
                  </div>
                )}
                <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                  Threshold: {item.restockThreshold} {item.unit}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.quantity <= 0}
                    onChange={() => toggleUsed(item)}
                    className="rounded border-zinc-700 bg-zinc-800 text-blue-500"
                  />
                  Mark as Used
                </label>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => handleDecrement(item)}
                    disabled={item.quantity <= 0}
                  >
                    -
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => handleIncrement(item)}
                  >
                    +
                  </Button>
                </div>
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

      {editingItem && (
        <EditPantryItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={updatePantryItemAction}
        />
      )}
    </div>
  );
}
