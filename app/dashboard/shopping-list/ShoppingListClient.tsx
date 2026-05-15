"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { purchaseItemAction } from "./actions";
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

  const updateRange = () => {
    const params = new URLSearchParams();
    params.set("start", startDate);
    params.set("end", endDate);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePurchase = async (item: ShoppingListItem) => {
    setPurchasedIds((prev) => new Set(prev).add(item.ingredientId));
    try {
      await purchaseItemAction(
        item.ingredientId,
        item.neededQuantity,
        item.unit,
      );
    } catch (error) {
      console.error(error);
      setPurchasedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.ingredientId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-end">
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
          <Button onClick={updateRange}>Update List</Button>
        </div>
      </Card>

      <div className="space-y-4">
        {initialList.map((item) => (
          <Card
            key={item.ingredientId}
            className={`p-4 flex justify-between items-center transition-opacity ${
              purchasedIds.has(item.ingredientId) ? "opacity-50 grayscale" : ""
            }`}
          >
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-sm text-zinc-500">
                {item.reason === "meal-plan" ? (
                  <>
                    Needed for meal plan: {item.requiredQuantity} {item.unit}{" "}
                    (In stock: {item.availableQuantity} {item.unit})
                  </>
                ) : (
                  <>Below restock threshold</>
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
                  purchasedIds.has(item.ingredientId) ? "ghost" : "default"
                }
                onClick={() => handlePurchase(item)}
                disabled={purchasedIds.has(item.ingredientId)}
              >
                {purchasedIds.has(item.ingredientId) ? "Purchased" : "Buy"}
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
