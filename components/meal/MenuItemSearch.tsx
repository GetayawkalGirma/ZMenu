"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Check } from "lucide-react";
import { Badge } from "@/components/ui";
import type { MenuItem } from "@/lib/types/meal";
import { searchMenuItems } from "@/app/admin/restaurant-management/menu-item-actions";

interface MenuItemSearchProps {
  onSelect: (item: MenuItem) => void;
  selectedItem?: MenuItem | null;
  onClear?: () => void;
}

export function MenuItemSearch({
  onSelect,
  selectedItem,
  onClear,
}: MenuItemSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MenuItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const result = await searchMenuItems(value);
        if (result.success && result.data) {
          setResults(result.data);
          setShowResults(result.data.length > 0);
        }
      } catch {
        console.error("Search failed");
      } finally {
        setSearching(false);
      }
    }, 250);
  };

  const handleSelect = (item: MenuItem) => {
    onSelect(item);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  if (selectedItem) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        {(selectedItem as any).imageUrl ? (
          <img
            src={(selectedItem as any).imageUrl}
            alt={selectedItem.name}
            className="w-12 h-12 rounded-lg object-cover border border-green-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{selectedItem.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-[10px]">
              {selectedItem.category?.name || "Uncategorized"}
            </Badge>
            {selectedItem.description && (
              <span className="text-xs text-gray-500 truncate">
                {selectedItem.description}
              </span>
            )}
          </div>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search for a meal (e.g. Burger, Pizza, Shiro)..."
          className="w-full h-11 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-auto">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b last:border-0 border-gray-50 flex items-center gap-3"
            >
              {(item as any).imageUrl ? (
                <img
                  src={(item as any).imageUrl}
                  alt={item.name}
                  className="w-10 h-10 rounded-md object-cover border border-gray-100 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-gray-400 text-xs">N/A</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="secondary" className="text-[10px] py-0">
                    {item.category?.name || "Uncategorized"}
                  </Badge>
                  {item.description && (
                    <span className="text-xs text-gray-400 truncate">
                      {item.description}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !searching && results.length === 0 && showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center">
          <p className="text-sm text-gray-500">No meals found for "{query}"</p>
          <p className="text-xs text-gray-400 mt-1">
            Create global meals first from the Meals page
          </p>
        </div>
      )}
    </div>
  );
}
