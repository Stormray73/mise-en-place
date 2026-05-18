/**
 * @file ImportRecipeModal.tsx
 * @responsibility Modal for importing recipes from URL, Text, or Files.
 * @dependencies Modal, Button, Input, importRecipeAction
 */

"use client";

import React, { useState } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { importRecipeAction } from "@/app/recipes/actions";
import { useRouter } from "next/navigation";

interface ImportRecipeModalProps {
  onClose: () => void;
}

export default function ImportRecipeModal({ onClose }: ImportRecipeModalProps) {
  const [activeTab, setActiveTab] = useState<"url" | "text" | "file">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleImport = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("type", activeTab);

    if (activeTab === "url") {
      if (!url) {
        setError("Please enter a URL");
        setLoading(false);
        return;
      }
      formData.append("url", url);
    } else if (activeTab === "text") {
      if (!text) {
        setError("Please enter some text");
        setLoading(false);
        return;
      }
      formData.append("text", text);
    } else if (activeTab === "file") {
      if (!file) {
        setError("Please select a file");
        setLoading(false);
        return;
      }
      formData.append("file", file);
    }

    const result = await importRecipeAction(formData);

    if (result.success) {
      if (result.data.type === "bulk") {
        router.push("/dashboard?review=drafts");
        onClose();
      } else if (result.data.recipes.length > 0) {
        // For single recipe, we don't have an ID yet if it wasn't saved.
        // The requirement says: "drops the user into the 'Edit Recipe' form"
        // Since we didn't save it yet (for single), we can pass the data via state or query param.
        // Actually, let's save it as a draft too and redirect to edit page.
        // Wait, importRecipeAction for single doesn't save it yet.
        // Let's modify importRecipeAction to save even single ones as drafts if we want to follow the routing easily.
        // Or we can use a client-side state.

        // I'll modify importRecipeAction to always save as DRAFT if it's an import.
        // No, let's just use the data and redirect to /recipes/new with the data.
        // Passing large data via query param is bad.
        // Let's use sessionStorage.
        sessionStorage.setItem(
          "importedRecipe",
          JSON.stringify(result.data.recipes[0]),
        );
        router.push("/recipes/new?imported=true");
        onClose();
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Modal title="Import Recipe" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex border-b border-zinc-800">
          <button
            className={`flex-1 py-2 px-4 text-sm font-bold ${
              activeTab === "url"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-zinc-500"
            }`}
            onClick={() => setActiveTab("url")}
          >
            URL
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-bold ${
              activeTab === "text"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-zinc-500"
            }`}
            onClick={() => setActiveTab("text")}
          >
            Text
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-bold ${
              activeTab === "file"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-zinc-500"
            }`}
            onClick={() => setActiveTab("file")}
          >
            File
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === "url" && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400">
                Recipe URL
              </label>
              <Input
                placeholder="https://example.com/recipe"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {activeTab === "text" && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400">
                Raw Recipe Text
              </label>
              <textarea
                className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Paste your recipe here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}

          {activeTab === "file" && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400">
                Upload Image or Document
              </label>
              <input
                type="file"
                accept=".txt,.pdf,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Supports Text, PDF, Word, and Images (JPG, PNG).
              </p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={loading}>
              {loading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
