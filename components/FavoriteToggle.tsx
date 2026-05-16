"use client";

import { useState } from "react";
import { toggleFavoriteAction } from "@/app/recipes/actions";

interface FavoriteToggleProps {
  recipeId: string;
  initialIsFavorite: boolean;
}

export default function FavoriteToggle({
  recipeId,
  initialIsFavorite,
}: FavoriteToggleProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, setIsPending] = useState(false);

  const toggleFavorite = async () => {
    if (isPending) return;
    setIsPending(true);
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);

    const result = await toggleFavoriteAction(recipeId, newStatus);
    if (!result.success) {
      // Revert on failure
      setIsFavorite(!newStatus);
      alert(result.error || "Failed to toggle favorite");
    }
    setIsPending(false);
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isPending}
      className={`text-2xl transition-colors ${
        isFavorite ? "text-yellow-500" : "text-zinc-600 hover:text-zinc-400"
      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
}
