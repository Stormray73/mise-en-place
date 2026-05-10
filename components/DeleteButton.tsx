"use client";

import { deleteRecipeAction } from "@/app/recipes/actions";
import { useState, useTransition } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteRecipeAction(id);
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete recipe. Please try again.");
      }
    });
  }

  if (isConfirming) {
    return (
      <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50"
        >
          {isPending ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
      title="Delete Recipe"
    >
      <svg
        className="w-5 h-5"
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
  );
}
