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
import {
  importRecipeAction,
  getPresignedUploadUrlAction,
} from "@/app/recipes/actions";
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
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setProcessingStatus("Initializing import...");

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

      if (file.size > 5 * 1024 * 1024) {
        setError("File must be smaller than 5MB");
        setLoading(false);
        return;
      }

      const isImage =
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(file.name);
      if (isImage) {
        // Try direct client-to-R2 upload to bypass Vercel 4.5MB payload limit
        try {
          setProcessingStatus("Uploading image to storage...");
          const presignedRes = await getPresignedUploadUrlAction(
            file.name,
            file.type,
          );
          if (presignedRes.success) {
            const { uploadUrl, publicUrl } = presignedRes.data;
            const uploadRes = await fetch(uploadUrl, {
              method: "PUT",
              headers: {
                "Content-Type": file.type,
              },
              body: file,
            });

            if (!uploadRes.ok) {
              throw new Error("Direct storage upload failed");
            }
            formData.append("imageUrl", publicUrl);
          } else {
            // Fallback for smaller files if R2 isn't configured
            if (file.size > 1 * 1024 * 1024) {
              setError(
                "Storage service is not configured to handle large file uploads.",
              );
              setLoading(false);
              return;
            }
            setProcessingStatus("Preparing image fallback...");
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (err) => reject(err);
            });
            formData.append("imageUrl", base64);
          }
        } catch (err) {
          console.error("Direct image upload error:", err);
          setError(
            err instanceof Error ? err.message : "Failed to upload image",
          );
          setLoading(false);
          return;
        }
      } else {
        // Handle document files (.txt, .pdf, .docx)
        formData.append("file", file);
      }
    }

    try {
      setProcessingStatus("AI reading and parsing recipe...");
      const result = await importRecipeAction(formData);

      if (result.success) {
        if (result.data.type === "bulk") {
          router.push("/recipes?drafts=true");
          onClose();
        } else if (result.data.recipes.length > 0) {
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
    } catch (err) {
      console.error("Recipe import request error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during import",
      );
    } finally {
      setLoading(false);
      setProcessingStatus(null);
    }
  };

  return (
    <Modal title="Import Recipe" onClose={onClose}>
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 space-y-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-purple-500 animate-spin" />
              <div className="absolute inset-2 rounded-full bg-zinc-950 flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                  CINC
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-zinc-400 font-medium tracking-wide animate-pulse">
                {processingStatus || "Processing..."}
              </p>
              <span className="text-xs text-zinc-500">
                Please wait while we parse your recipe.
              </span>
            </div>
          </div>
        ) : (
          <>
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
                  Import
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
