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
  initialValue?: string;
  onChange?: (value: string) => void;
  clearOnSelect?: boolean;
  onSelect: (item: T) => void;
  onSearch: (query: string) => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  minChars?: number;
  className?: string;
  footerAction?: (query: string) => React.ReactNode;
  selectedItem?: T | null;
  getOptionLabel?: (item: T) => string;
  selectedText?: string;
  onClearSelection?: () => void;
}

export function Autocomplete<T>({
  label,
  placeholder,
  initialValue,
  onChange,
  clearOnSelect = true,
  onSelect,
  onSearch,
  renderItem,
  keyExtractor,
  minChars = 2,
  className = "",
  footerAction,
  selectedItem = null,
  getOptionLabel,
  selectedText,
  onClearSelection,
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState(initialValue || "");
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasSelection = !!(selectedItem || selectedText);

  useEffect(() => {
    if (selectedItem && getOptionLabel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(getOptionLabel(selectedItem));
    }
  }, [selectedItem, getOptionLabel]);

  useEffect(() => {
    if (initialValue !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocusedIndex(-1);
  }, [results]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setResults([]);
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setResults([]);
        setIsOpen(false);
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
    setIsOpen(true);
    if (onChange) {
      onChange(val);
    }
    if (hasSelection && onClearSelection) {
      onClearSelection();
    }

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
    if (getOptionLabel) {
      setQuery(getOptionLabel(item));
    } else if (clearOnSelect) {
      setQuery("");
    }
    setResults([]);
    setFocusedIndex(-1);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setResults([]);
      setFocusedIndex(-1);
      setIsOpen(false);
      if (selectedText && !hasSelection) {
        setQuery("");
      }
      return;
    }

    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        if (results.length === 0) return -1;
        return (prev + 1) % results.length;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        if (results.length === 0) return -1;
        if (prev <= 0) return results.length - 1;
        return prev - 1;
      });
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < results.length) {
        e.preventDefault();
        handleSelect(results[focusedIndex]);
      }
    }
  };

  const showDropdown =
    isOpen && query.length >= minChars && (results.length > 0 || footerAction);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
      )}
      <div className="relative flex items-center w-full">
        <Input
          placeholder={placeholder}
          value={selectedText || query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          disabled={!!selectedText}
          className={`${hasSelection ? "pr-10" : ""} ${
            selectedText
              ? "border-emerald-500/80 focus:ring-emerald-500/50"
              : ""
          }`}
        />
        {hasSelection && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
                title="Clear selection"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        {isSearching && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 animate-pulse">
            Searching...
          </div>
        )}
      </div>
      {showDropdown && (
        <div
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl max-h-60 overflow-auto"
        >
          {results.map((item, index) => (
            <button
              key={keyExtractor(item)}
              role="option"
              aria-selected={focusedIndex === index}
              type="button"
              onClick={() => handleSelect(item)}
              className={`w-full text-left px-4 py-2 transition-colors border-b border-zinc-700 last:border-0 ${
                focusedIndex === index
                  ? "bg-zinc-700 text-white"
                  : "hover:bg-zinc-700 text-zinc-200"
              }`}
            >
              {renderItem(item)}
            </button>
          ))}
          {footerAction && (
            <div className="border-t border-zinc-700 bg-zinc-800 sticky bottom-0">
              {footerAction(query)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
