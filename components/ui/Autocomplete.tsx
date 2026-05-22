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
  selectedText,
  onClearSelection,
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState(initialValue || "");
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValue !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightedIndex(-1);
  }, [results]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setResults([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) {
      onChange(val);
    }

    if (val.length < minChars) {
      setResults([]);
      setHighlightedIndex(-1);
      return;
    }

    setIsSearching(true);
    try {
      const items = await onSearch(val);
      setResults(items);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error("Autocomplete search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    if (clearOnSelect) {
      setQuery("");
    }
    setResults([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setResults([]);
      setHighlightedIndex(-1);
      if (!selectedText) {
        setQuery("");
      }
      return;
    }

    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= results.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? results.length - 1 : next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelect(results[highlightedIndex]);
      }
    }
  };

  const showDropdown =
    query.length >= minChars && (results.length > 0 || footerAction);

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
          disabled={!!selectedText}
          className={`${selectedText ? "border-emerald-500/80 focus:ring-emerald-500/50 pr-10" : ""}`}
        />
        {selectedText && (
          <div className="absolute right-2 flex items-center gap-1">
            <span className="text-emerald-500" title="API Match Successful">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      {isSearching && (
        <div className="absolute right-2 top-8 text-[10px] text-zinc-500 animate-pulse">
          Searching...
        </div>
      )}
      {showDropdown && (
        <div
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl max-h-60 overflow-auto"
        >
          {results.map((item, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <button
                key={keyExtractor(item)}
                role="option"
                aria-selected={isHighlighted}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-4 py-2 transition-colors border-b border-zinc-700 last:border-0 ${
                  isHighlighted ? "bg-zinc-700 text-white" : "hover:bg-zinc-700"
                }`}
              >
                {renderItem(item)}
              </button>
            );
          })}
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
