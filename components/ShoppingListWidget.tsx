/**
 * @file ShoppingListWidget.tsx
 * @responsibility Display a truncated shopping list and provide quick-add functionality on the dashboard.
 * @dependencies React, Card, Input, Button, actions
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingListItem } from "@/lib/shopping-list";
import { addManualShoppingItemAction } from "@/app/dashboard/shopping-list/actions";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface ShoppingListWidgetProps {
  items: ShoppingListItem[];
}

export default function ShoppingListWidget({ items }: ShoppingListWidgetProps) {
  const [newItemName, setNewItemName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isAdding) return;

    setIsAdding(true);
    const res = await addManualShoppingItemAction(newItemName.trim());
    if (res.success) {
      setNewItemName("");
    } else {
      alert(res.error || "Failed to add item");
    }
    setIsAdding(false);
  };

  const displayedItems = items.slice(0, 5);

  return (
    <Card data-testid="shopping-list-widget">
      <CardHeader>
        <CardTitle>Shopping List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Add Form */}
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Quick add item..."
              className="h-8 text-sm"
              disabled={isAdding}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isAdding || !newItemName.trim()}
              className="h-8 px-3"
            >
              {isAdding ? "..." : "+"}
            </Button>
          </form>

          {/* Items List */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-zinc-500 text-sm italic py-2">
                Your shopping list is empty.
              </p>
            ) : (
              <>
                <ul className="space-y-1">
                  {displayedItems.map((item, i) => (
                    <li
                      key={item.id || item.ingredientId || i}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-zinc-300 truncate mr-2">
                        {item.name}
                      </span>
                      <span className="text-zinc-500 font-mono text-xs whitespace-nowrap">
                        {item.neededQuantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
                {items.length > 5 && (
                  <p className="text-[10px] text-zinc-600 italic">
                    + {items.length - 5} more items
                  </p>
                )}
              </>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/dashboard/shopping-list"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              View full list &rarr;
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
