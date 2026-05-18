/**
 * @file RecipeStoreHeader.tsx
 * @responsibility Client-side header for Recipe Store with Import and New Recipe buttons.
 * @dependencies ImportRecipeModal, Link
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import ImportRecipeModal from "@/components/ImportRecipeModal";

export default function RecipeStoreHeader() {
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <div className="flex-1 flex justify-end gap-3">
      <button
        onClick={() => setShowImportModal(true)}
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md font-bold transition-colors whitespace-nowrap"
      >
        Import
      </button>
      <Link
        href="/recipes/new"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold transition-colors whitespace-nowrap"
      >
        + New Recipe
      </Link>

      {showImportModal && (
        <ImportRecipeModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
