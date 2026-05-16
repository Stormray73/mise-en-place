"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  purchaseItemAction,
  addManualShoppingItemAction,
  deleteManualShoppingItemAction,
} from "./actions";
import { ShoppingListItem } from "@/lib/shopping-list";
import { useRouter, usePathname } from "next/navigation";

interface ShoppingListClientProps {
  initialList: ShoppingListItem[];
  initialStart: string;
  initialEnd: string;
}

export default function ShoppingListClient({
  initialList,
  initialStart,
  initialEnd,
}: ShoppingListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

  // Quick Add State
  const [newItemName, setNewItemName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const updateRange = () => {
    const params = new URLSearchParams();
    params.set("start", startDate);
    params.set("end", endDate);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePurchase = async (item: ShoppingListItem) => {
    if (item.reason === "manual" && item.id) {
      await deleteManualShoppingItemAction(item.id);
      return;
    }

    if (!item.ingredientId) return;

    setPurchasedIds((prev) => new Set(prev).add(item.ingredientId!));
    try {
      await purchaseItemAction(
        item.ingredientId!,
        item.neededQuantity,
        item.unit,
      );
    } catch (error) {
      console.error(error);
      setPurchasedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.ingredientId!);
        return next;
      });
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isAdding) return;

    setIsAdding(true);
    const res = await addManualShoppingItemAction(
      newItemName.trim(),
      1,
      undefined,
      isRecurring,
    );
    if (res.success) {
      setNewItemName("");
      setIsRecurring(false);
      router.refresh();
    } else {
      alert(res.error || "Failed to add item");
    }
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-lg font-bold mb-4">Date Range</h2>
          <div className="space-y-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button onClick={updateRange} className="w-full">
              Update List
            </Button>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Add Custom Item</h2>
          <form onSubmit={handleQuickAdd} className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="What do you need? (e.g. Paper Towels)"
                className="flex-1"
              />
              <Button type="submit" disabled={isAdding || !newItemName.trim()}>
                {isAdding ? "Adding..." : "Add to List"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring-main"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-0"
              />
              <label
                htmlFor="isRecurring-main"
                className="text-sm text-zinc-400 cursor-pointer"
              >
                Mark as Recurring (Item will stay on list after buying)
              </label>
            </div>
          </form>
        </Card>
      </div>

      <div className="space-y-4">
        {initialList.map((item, i) => (
          <Card
            key={item.id || item.ingredientId || i}
            className={`p-4 flex justify-between items-center transition-opacity ${
              item.ingredientId && purchasedIds.has(item.ingredientId)
                ? "opacity-50 grayscale"
                : ""
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{item.name}</h3>
                {item.reason === "manual" && (
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded-full border border-zinc-700 uppercase font-bold tracking-tighter">
                    Manual
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500">
                {item.reason === "meal-plan" ? (
                  <>
                    Needed for meal plan: {item.requiredQuantity} {item.unit}{" "}
                    (In stock: {item.availableQuantity} {item.unit})
                  </>
                ) : item.reason === "low-stock" ? (
                  <>Below restock threshold</>
                ) : (
                  <>Added manually</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xl font-mono font-bold">
                  {item.neededQuantity.toFixed(1).replace(/\.0$/, "")}{" "}
                  {item.unit}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">
                  To Buy
                </div>
              </div>

              <Button
                variant={
                  item.ingredientId && purchasedIds.has(item.ingredientId)
                    ? "ghost"
                    : "primary"
                }
                onClick={() => handlePurchase(item)}
                disabled={
                  !!item.ingredientId && purchasedIds.has(item.ingredientId)
                }
              >
                {item.ingredientId && purchasedIds.has(item.ingredientId)
                  ? "Purchased"
                  : item.reason === "manual"
                    ? "Remove"
                    : "Buy"}
              </Button>
            </div>
          </Card>
        ))}

        {initialList.length === 0 && (
          <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800">
            Your shopping list is empty! Either you have everything you need, or
            you haven&apos;t planned any meals for this range.
          </div>
        )}
      </div>
    </div>
  );
}
