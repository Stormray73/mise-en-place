"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import {
  addManualShoppingItemAction,
  deleteManualShoppingItemAction,
  completeShopAction,
  getStoresAction,
  createStoreAction,
  deleteStoreAction,
  assignStoreToIngredientAction,
  assignStoreToManualItemAction,
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
  const [recurrenceInterval, setRecurrenceInterval] = useState("7");

  const getThisWeek = () => {
    const today = new Date();
    const start = new Date(today.setDate(today.getDate() - today.getDay()));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  const getNextWeek = () => {
    const today = new Date();
    const start = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  const getRolling7Days = () => {
    const today = new Date();
    const start = today.toISOString().split("T")[0];
    const end = new Date(today.setDate(today.getDate() + 6))
      .toISOString()
      .split("T")[0];
    return { start, end };
  };

  const isThisWeekActive = () => {
    const tw = getThisWeek();
    return startDate === tw.start && endDate === tw.end;
  };

  const isNextWeekActive = () => {
    const nw = getNextWeek();
    return startDate === nw.start && endDate === nw.end;
  };

  const isRolling7DaysActive = () => {
    const r7 = getRolling7Days();
    return startDate === r7.start && endDate === r7.end;
  };

  const isCustomActive = () => {
    return (
      !isThisWeekActive() && !isNextWeekActive() && !isRolling7DaysActive()
    );
  };

  // Stores State
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [selectedStoreTab, setSelectedStoreTab] = useState<string>("all");
  const [newStoreName, setNewStoreName] = useState("");
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [showManageStores, setShowManageStores] = useState(false);

  // Active Shopping Mode States
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [actualQuantities, setActualQuantities] = useState<
    Record<string, number>
  >({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Custom Item Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState("item");
  const [newItemStoreId, setNewItemStoreId] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [newItemRecurringInterval, setNewItemRecurringInterval] =
    useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch stores on mount
  useEffect(() => {
    async function loadStores() {
      const res = await getStoresAction();
      if (res.success && res.data) {
        setStores(res.data);
      }
    }
    loadStores();
  }, []);

  const formatDateStr = (d: Date) => d.toISOString().split("T")[0];

  const updateRangeWithDates = (start: string, end: string) => {
    const params = new URLSearchParams();
    params.set("start", start);
    params.set("end", end);
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPresetRanges = () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setUTCDate(
      thisWeekStart.getUTCDate() - thisWeekStart.getUTCDay(),
    );
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setUTCDate(thisWeekEnd.getUTCDate() + 7);

    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setUTCDate(nextWeekEnd.getUTCDate() + 7);

    const rollingStart = new Date(today);
    const rollingEnd = new Date(rollingStart);
    rollingEnd.setUTCDate(rollingEnd.getUTCDate() + 7);

    return {
      thisWeek: {
        start: formatDateStr(thisWeekStart),
        end: formatDateStr(thisWeekEnd),
      },
      nextWeek: {
        start: formatDateStr(nextWeekStart),
        end: formatDateStr(nextWeekEnd),
      },
      rolling: {
        start: formatDateStr(rollingStart),
        end: formatDateStr(rollingEnd),
      },
    };
  };

  const presets = getPresetRanges();

  let activePreset = "custom";
  if (
    startDate === presets.thisWeek.start &&
    endDate === presets.thisWeek.end
  ) {
    activePreset = "this-week";
  } else if (
    startDate === presets.nextWeek.start &&
    endDate === presets.nextWeek.end
  ) {
    activePreset = "next-week";
  } else if (
    startDate === presets.rolling.start &&
    endDate === presets.rolling.end
  ) {
    activePreset = "rolling-7-days";
  }

  const handlePresetSelect = (preset: string) => {
    let start = startDate;
    let end = endDate;

    if (preset === "this-week") {
      start = presets.thisWeek.start;
      end = presets.thisWeek.end;
    } else if (preset === "next-week") {
      start = presets.nextWeek.start;
      end = presets.nextWeek.end;
    } else if (preset === "rolling-7-days") {
      start = presets.rolling.start;
      end = presets.rolling.end;
    } else {
      return;
    }

    setStartDate(start);
    setEndDate(end);
    updateRangeWithDates(start, end);
  };

  const handlePrevWeek = () => {
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    currentStart.setDate(currentStart.getDate() - 7);
    currentEnd.setDate(currentEnd.getDate() - 7);

    const startStr = currentStart.toISOString().split("T")[0];
    const endStr = currentEnd.toISOString().split("T")[0];
    setStartDate(startStr);
    setEndDate(endStr);
    updateRangeWithDates(startStr, endStr);
  };

  const handleNextWeek = () => {
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    currentStart.setDate(currentStart.getDate() + 7);
    currentEnd.setDate(currentEnd.getDate() + 7);

    const startStr = currentStart.toISOString().split("T")[0];
    const endStr = currentEnd.toISOString().split("T")[0];
    setStartDate(startStr);
    setEndDate(endStr);
    updateRangeWithDates(startStr, endStr);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isAdding) return;

    setIsAdding(true);
    const res = await addManualShoppingItemAction(
      newItemName.trim(),
      newItemQuantity,
      newItemUnit || undefined,
      isRecurring,
      newItemStoreId || undefined,
      isRecurring ? newItemRecurringInterval || null : null,
    );
    if (res.success) {
      setNewItemName("");
      setNewItemQuantity(1);
      setNewItemUnit("item");
      setNewItemStoreId("");
      setIsRecurring(false);
      setNewItemRecurringInterval("");
      router.refresh();
    } else {
      alert(res.error || "Failed to add item");
    }
    setIsAdding(false);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || isCreatingStore) return;

    setIsCreatingStore(true);
    const res = await createStoreAction(newStoreName.trim());
    if (res.success) {
      setStores((prev) =>
        [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setNewStoreName("");
    } else {
      alert(res.error || "Failed to create store");
    }
    setIsCreatingStore(false);
  };

  const handleDeleteStore = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this store? Items assigned to it will become unassigned.",
      )
    )
      return;

    const res = await deleteStoreAction(id);
    if (res.success) {
      setStores((prev) => prev.filter((s) => s.id !== id));
      if (selectedStoreTab === id) {
        setSelectedStoreTab("all");
      }
      router.refresh();
    } else {
      alert(res.error || "Failed to delete store");
    }
  };

  const handleAssignStore = async (item: ShoppingListItem, storeId: string) => {
    const sId = storeId === "" ? null : storeId;
    if (item.reason === "manual" && item.id) {
      const res = await assignStoreToManualItemAction(item.id, sId);
      if (!res.success) {
        alert(res.error || "Failed to assign store");
      } else {
        router.refresh();
      }
    } else if (item.ingredientId) {
      const res = await assignStoreToIngredientAction(item.ingredientId, sId);
      if (!res.success) {
        alert(res.error || "Failed to assign store");
      } else {
        router.refresh();
      }
    }
  };

  const handleItemCheck = (key: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleQuantityChange = (key: string, val: number) => {
    setActualQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  // Helper to generate a unique key for each item
  const getItemKey = (item: ShoppingListItem) => {
    return item.reason === "manual" && item.id
      ? `manual-${item.id}`
      : `ing-${item.ingredientId}`;
  };

  // Filter items based on selected store tab
  const filteredList = initialList.filter((item) => {
    if (selectedStoreTab === "all") return true;
    if (selectedStoreTab === "unassigned") return !item.storeId;
    return item.storeId === selectedStoreTab;
  });

  // Group filtered items by Department
  const groupedItems: Record<string, ShoppingListItem[]> = {};
  for (const item of filteredList) {
    const dept = item.department || "Pantry";
    if (!groupedItems[dept]) {
      groupedItems[dept] = [];
    }
    groupedItems[dept].push(item);
  }

  // Department Sort Order (Produce first, then Meat, Dairy, Bakery, Beverages, Pantry, Frozen last)
  const departmentOrder = [
    "Produce",
    "Meat & Seafood",
    "Dairy & Eggs",
    "Bakery",
    "Beverages",
    "Pantry",
    "Frozen",
  ];

  const sortedDepartments = Object.keys(groupedItems).sort((a, b) => {
    const indexA = departmentOrder.indexOf(a);
    const indexB = departmentOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const handleCompleteShop = async () => {
    const checkedList = filteredList.filter(
      (item) => checkedItems[getItemKey(item)],
    );
    if (checkedList.length === 0) {
      alert("Please check at least one item before completing your shop!");
      return;
    }

    setIsCompleting(true);
    const payload = checkedList.map((item) => {
      const key = getItemKey(item);
      const qty =
        actualQuantities[key] !== undefined
          ? actualQuantities[key]
          : item.neededQuantity;
      return {
        id: item.id,
        ingredientId: item.ingredientId,
        quantity: qty,
        unit: item.unit,
        reason: item.reason,
      };
    });

    const activeStoreId =
      selectedStoreTab === "all" || selectedStoreTab === "unassigned"
        ? null
        : selectedStoreTab;
    const res = await completeShopAction(activeStoreId, payload);
    if (res.success) {
      setIsShoppingMode(false);
      setCheckedItems({});
      setActualQuantities({});
      router.refresh();
    } else {
      alert(res.error || "Failed to check out items.");
    }
    setIsCompleting(false);
  };

  const activeCheckedCount = filteredList.filter(
    (item) => checkedItems[getItemKey(item)],
  ).length;

  return (
    <div className="space-y-8 pb-24">
      {/* Date Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => handlePresetSelect("this-week")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activePreset === "this-week"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handlePresetSelect("next-week")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activePreset === "next-week"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Next Week
            </button>
            <button
              onClick={() => handlePresetSelect("rolling-7-days")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activePreset === "rolling-7-days"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Rolling 7 Days
            </button>
            <button
              onClick={() => handlePresetSelect("custom")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activePreset === "custom"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Quick Prev/Next buttons */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevWeek}
              className="text-zinc-400 hover:text-zinc-200 h-8 px-2"
            >
              &larr; Prev Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextWeek}
              className="text-zinc-400 hover:text-zinc-200 h-8 px-2"
            >
              Next Week &rarr;
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              if (isShoppingMode) {
                setIsShoppingMode(false);
              } else {
                setIsShoppingMode(true);
                // Pre-fill quantities
                const prefilledQty: Record<string, number> = {};
                filteredList.forEach((item) => {
                  prefilledQty[getItemKey(item)] = item.neededQuantity;
                });
                setActualQuantities(prefilledQty);
              }
            }}
            variant={isShoppingMode ? "ghost" : "primary"}
            className={
              isShoppingMode
                ? "border border-red-500/50 hover:bg-red-500/10 text-red-400"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/10 font-bold"
            }
          >
            {isShoppingMode ? "Exit Shopping Mode" : "🛒 Go Shopping"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManageStores(!showManageStores)}
            className="text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          >
            ⚙️ Manage Stores
          </Button>
        </div>
      </div>

      {/* Store Management Section */}
      {showManageStores && (
        <Card className="p-6 border border-zinc-800 bg-zinc-900/40 backdrop-blur-md animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-zinc-100">
              Store Management
            </h3>
            <button
              onClick={() => setShowManageStores(false)}
              className="text-zinc-500 hover:text-zinc-300 text-sm font-bold"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleCreateStore} className="space-y-4">
              <label className="block text-sm font-semibold text-zinc-300 mb-1">
                Add New Store
              </label>
              <div className="flex gap-2">
                <Input
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. Costco, Trader Joe's"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isCreatingStore || !newStoreName.trim()}
                >
                  {isCreatingStore ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-300 mb-1">
                Existing Stores
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="flex justify-between items-center p-2 bg-zinc-800/60 rounded border border-zinc-700/50"
                  >
                    <span className="text-sm font-medium text-zinc-200">
                      {store.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteStore(store.id)}
                      className="text-red-500 hover:text-red-400 text-xs font-semibold px-2 py-1 rounded hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {stores.length === 0 && (
                  <p className="text-xs text-zinc-500 italic">
                    No stores created yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Forms and Multi-Store Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-1 h-fit border border-zinc-800 bg-zinc-900/30">
          <h2 className="text-lg font-bold mb-4 text-zinc-200">
            Filters & Range
          </h2>
          <div className="space-y-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              disabled={activePreset !== "custom"}
              onChange={(e) => setStartDate(e.target.value)}
              className={
                activePreset !== "custom" ? "opacity-60 cursor-not-allowed" : ""
              }
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              disabled={activePreset !== "custom"}
              onChange={(e) => setEndDate(e.target.value)}
              className={
                activePreset !== "custom" ? "opacity-60 cursor-not-allowed" : ""
              }
            />
            <Button
              onClick={() => updateRangeWithDates(startDate, endDate)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold"
            >
              Update List
            </Button>
            {activePreset !== "custom" && (
              <div className="text-xs text-zinc-500 italic text-center pt-2">
                Dates locked by preset. Select &quot;Custom Range&quot; to edit.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2 border border-zinc-800 bg-zinc-900/30">
          <h2 className="text-lg font-bold mb-4 text-zinc-200">
            Add Custom Item
          </h2>
          <form onSubmit={handleQuickAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Input
                  label="Name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="What do you need?"
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  label="Quantity"
                  type="number"
                  step="any"
                  value={newItemQuantity}
                  onChange={(e) =>
                    setNewItemQuantity(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Qty"
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  label="Unit"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  placeholder="e.g. lbs, bags, cans"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Preferred Store
                </label>
                <Select
                  value={newItemStoreId}
                  onChange={(e) => setNewItemStoreId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col justify-center space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => {
                      setIsRecurring(e.target.checked);
                      if (!e.target.checked) {
                        setNewItemRecurringInterval("");
                      }
                    }}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-0"
                  />
                  <span className="text-sm text-zinc-400 font-medium">
                    Recurring item (Auto-restocks)
                  </span>
                </label>

                {isRecurring && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Restock Interval
                    </label>
                    <Select
                      value={newItemRecurringInterval}
                      onChange={(e) =>
                        setNewItemRecurringInterval(e.target.value)
                      }
                      className="text-xs h-8 bg-zinc-850 border-zinc-700 text-zinc-300"
                    >
                      <option value="">Always (every cycle)</option>
                      <option value="1_week">Every week</option>
                      <option value="2_weeks">Every 2 weeks</option>
                      <option value="3_weeks">Every 3 weeks</option>
                      <option value="monthly">Every month</option>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isAdding || !newItemName.trim()}>
                {isAdding ? "Adding..." : "Add to List"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Multi-Store Tab Filter */}
      <div className="border-b border-zinc-800 flex gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setSelectedStoreTab("all")}
          className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all ${
            selectedStoreTab === "all"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          All Items ({initialList.length})
        </button>
        <button
          onClick={() => setSelectedStoreTab("unassigned")}
          className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all ${
            selectedStoreTab === "unassigned"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Unassigned ({initialList.filter((i) => !i.storeId).length})
        </button>
        {stores.map((store) => {
          const count = initialList.filter(
            (item) => item.storeId === store.id,
          ).length;
          return (
            <button
              key={store.id}
              onClick={() => setSelectedStoreTab(store.id)}
              className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                selectedStoreTab === store.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🏪 {store.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Grouped Shopping List Display */}
      <div className="space-y-8">
        {sortedDepartments.map((dept) => {
          const deptItems = groupedItems[dept] || [];
          return (
            <div key={dept} className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 px-1">
                <span className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                {dept} ({deptItems.length})
              </h3>
              <div className="space-y-3">
                {deptItems.map((item) => {
                  const key = getItemKey(item);
                  const isChecked = checkedItems[key] || false;
                  const currentQty =
                    actualQuantities[key] !== undefined
                      ? actualQuantities[key]
                      : item.neededQuantity;

                  return (
                    <Card
                      key={key}
                      className={`p-4 flex justify-between items-center transition-all duration-200 border border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-800/20 ${
                        isShoppingMode && isChecked
                          ? "opacity-50 border-emerald-500/20 bg-emerald-950/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {isShoppingMode ? (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              handleItemCheck(key, e.target.checked)
                            }
                            className="w-5 h-5 rounded-md border-zinc-700 bg-zinc-800 text-emerald-600 focus:ring-0 cursor-pointer"
                          />
                        ) : (
                          <div className="w-1 h-8 bg-zinc-800 rounded-full shrink-0" />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`font-bold text-base text-zinc-100 ${
                                isShoppingMode && isChecked
                                  ? "line-through text-zinc-500"
                                  : ""
                              }`}
                            >
                              {item.name}
                            </h4>
                            {item.reason === "manual" && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-blue-900/20 border border-blue-500/30 text-blue-400 rounded uppercase font-bold tracking-tight">
                                Manual
                              </span>
                            )}
                            {item.isRecurring && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-teal-900/20 border border-teal-500/30 text-teal-400 rounded uppercase font-bold tracking-tight">
                                Recurring
                                {item.recurringInterval === "1_week" &&
                                  " (Weekly)"}
                                {item.recurringInterval === "2_weeks" &&
                                  " (Bi-weekly)"}
                                {item.recurringInterval === "3_weeks" &&
                                  " (3-weekly)"}
                                {item.recurringInterval === "monthly" &&
                                  " (Monthly)"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {item.reason === "meal-plan" ? (
                              <>
                                Needed for meal plan: {item.requiredQuantity}{" "}
                                {item.unit} (Pantry stock:{" "}
                                {item.availableQuantity} {item.unit})
                              </>
                            ) : item.reason === "low-stock" ? (
                              <>Below pantry restock threshold</>
                            ) : (
                              <>Custom added item</>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Store Picker & Quantities */}
                      <div className="flex items-center gap-4 ml-4 shrink-0">
                        {/* Store selection in planning mode */}
                        {!isShoppingMode && (
                          <div className="w-32">
                            <Select
                              value={item.storeId || ""}
                              onChange={(e) =>
                                handleAssignStore(item, e.target.value)
                              }
                              className="text-xs h-8 bg-zinc-800/80 border border-zinc-700 text-zinc-300"
                            >
                              <option value="">Unassigned</option>
                              {stores.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </Select>
                          </div>
                        )}

                        {/* Store Label in shopping mode */}
                        {isShoppingMode && item.storeName && (
                          <span className="text-xs text-zinc-500 font-medium px-2 py-0.5 bg-zinc-800/40 border border-zinc-700/30 rounded">
                            🏪 {item.storeName}
                          </span>
                        )}

                        {/* Quantities column */}
                        <div className="flex items-center gap-2">
                          {isShoppingMode ? (
                            <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-md overflow-hidden">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(key, currentQty - 1)
                                }
                                className="px-2 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 font-bold transition-all text-sm"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                step="any"
                                value={currentQty}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    key,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-12 bg-transparent text-center text-xs font-mono font-bold text-zinc-100 border-none outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(key, currentQty + 1)
                                }
                                className="px-2 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 font-bold transition-all text-sm"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <div className="text-right">
                              <div className="text-base font-mono font-bold text-zinc-100">
                                {item.neededQuantity
                                  .toFixed(1)
                                  .replace(/\.0$/, "")}{" "}
                                {item.unit}
                              </div>
                            </div>
                          )}

                          <span className="text-xs font-bold text-zinc-400 lowercase w-8 text-left pl-1">
                            {isShoppingMode ? item.unit : "to buy"}
                          </span>
                        </div>

                        {/* Delete manual item button */}
                        {!isShoppingMode &&
                          item.reason === "manual" &&
                          item.id && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove "${item.name}"?`)) {
                                  deleteManualShoppingItemAction(item.id!).then(
                                    () => router.refresh(),
                                  );
                                }
                              }}
                              className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete manual item"
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
                          )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="text-center py-12 text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
            No items in this category. Either you have everything you need, or
            you haven&apos;t planned any meals for this range or store.
          </div>
        )}
      </div>

      {/* Floating Complete Checkout Action Bar (Active Shopping Mode) */}
      {isShoppingMode && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-xl bg-zinc-900 border border-emerald-500/30 shadow-xl shadow-emerald-500/5 p-4 rounded-xl flex items-center justify-between gap-4 z-50 animate-bounce-subtle backdrop-blur-lg">
          <div>
            <div className="text-sm font-bold text-zinc-200">
              🛒 Shopping (
              {selectedStoreTab === "all"
                ? "All Stores"
                : stores.find((s) => s.id === selectedStoreTab)?.name ||
                  "Unassigned"}
              )
            </div>
            <div className="text-xs text-zinc-500">
              {activeCheckedCount} of {filteredList.length} items checked
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsShoppingMode(false)}
              variant="ghost"
              className="text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const checkedList = filteredList.filter(
                  (item) => checkedItems[getItemKey(item)],
                );
                if (checkedList.length === 0) {
                  alert(
                    "Please check at least one item before completing your shop!",
                  );
                  return;
                }
                setIsConfirmOpen(true);
              }}
              disabled={isCompleting || activeCheckedCount === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/10"
            >
              {isCompleting
                ? "Saving..."
                : `Complete Shop (${activeCheckedCount})`}
            </Button>
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <Modal
          title="Confirm Purchase & Checkout"
          onClose={() => setIsConfirmOpen(false)}
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              The following checked items and their final quantities will be
              committed and added to your pantry:
            </p>
            <div className="max-h-60 overflow-y-auto border border-zinc-800 rounded-lg p-3 bg-zinc-950/40 space-y-2">
              {filteredList
                .filter((item) => checkedItems[getItemKey(item)])
                .map((item) => {
                  const key = getItemKey(item);
                  const qty =
                    actualQuantities[key] !== undefined
                      ? actualQuantities[key]
                      : item.neededQuantity;
                  return (
                    <div
                      key={key}
                      className="flex justify-between items-center text-xs py-1 border-b border-zinc-800 last:border-0"
                    >
                      <span className="font-medium text-zinc-200 truncate pr-4">
                        {item.name}
                      </span>
                      <span className="font-mono text-blue-400 font-bold shrink-0">
                        {qty.toFixed(1).replace(/\.0$/, "")} {item.unit}
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-850">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsConfirmOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  setIsConfirmOpen(false);
                  await handleCompleteShop();
                }}
                disabled={isCompleting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/10"
              >
                Yes, Commit to Pantry
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
