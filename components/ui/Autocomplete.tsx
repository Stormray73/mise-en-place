/**
 * FILE: components/ui/Autocomplete.tsx
 * DESCRIPTION: Generic autocomplete component for the Kitchen UI.
 * STANDARDS: TDD, Clean UI.
 */

import React, { useState, useEffect, useRef } from "react";
import { Input } from "./Input";

interface AutocompleteProps<T> {
  label?: string;
  placeholder?: string;
  onSelect: (item: T) => void;
  onSearch: (query: string) => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  minChars?: number;
  className?: string;
}

export function Autocomplete<T>({
  label,
  placeholder,
  onSelect,
  onSearch,
  renderItem,
  keyExtractor,
  minChars = 2,
  className = "",
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setResults([]);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setResults([]);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length < minChars) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const items = await onSearch(val);
      setResults(items);
    } catch (error) {
      console.error("Autocomplete search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    setQuery("");
    setResults([]);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
      )}
      <Input
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
      />
      {isSearching && (
        <div className="absolute right-2 top-8 text-[10px] text-zinc-500 animate-pulse">
          Searching...
        </div>
      )}
      {results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl max-h-60 overflow-auto">
          {results.map((item) => (
            <button
              key={keyExtractor(item)}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2 hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-0"
            >
              {renderItem(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
