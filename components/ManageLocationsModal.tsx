/**
 * @file ManageLocationsModal.tsx
 * @responsibility Modal UI for managing user-specific pantry locations.
 */

"use client";

import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { PantryLocation } from "@/types";
import {
  getLocationsAction,
  createLocationAction,
  deleteLocationAction,
} from "@/app/dashboard/pantry/location-actions";

interface ManageLocationsModalProps {
  onClose: () => void;
}

export default function ManageLocationsModal({
  onClose,
}: ManageLocationsModalProps) {
  const [locations, setLocations] = useState<PantryLocation[]>([]);
  const [newName, setNewName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      const res = await getLocationsAction();
      if (res.success && res.data) {
        setLocations(res.data);
      }
      setIsLoading(false);
    };

    fetchLocations();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isPending) return;

    setIsPending(true);
    setError(null);
    const res = await createLocationAction(newName.trim());
    if (res.success) {
      setNewName("");
      const refreshRes = await getLocationsAction();
      if (refreshRes.success && refreshRes.data) {
        setLocations(refreshRes.data);
      }
    } else {
      setError(res.error || "Failed to create location");
    }
    setIsPending(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? Items in this location will be uncategorized."))
      return;

    const res = await deleteLocationAction(id);
    if (res.success) {
      const refreshRes = await getLocationsAction();
      if (refreshRes.success && refreshRes.data) {
        setLocations(refreshRes.data);
      }
    } else {
      alert(res.error || "Failed to delete location");
    }
  };

  return (
    <Modal title="Manage Pantry Locations" onClose={onClose}>
      <div className="space-y-6 min-w-[320px]">
        {error && (
          <div className="p-2 bg-red-900/20 border border-red-500 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New location name..."
            className="flex-1"
          />
          <Button type="submit" disabled={isPending || !newName.trim()}>
            {isPending ? "..." : "Add"}
          </Button>
        </form>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <p className="text-zinc-500 text-sm italic text-center py-4">
              Loading locations...
            </p>
          ) : locations.length === 0 ? (
            <p className="text-zinc-500 text-sm italic text-center py-4">
              No custom locations yet.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {locations.map((loc) => (
                <li
                  key={loc.id}
                  className="py-3 flex justify-between items-center group"
                >
                  <span className="text-sm font-medium text-zinc-200">
                    {loc.name}
                  </span>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete location"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
