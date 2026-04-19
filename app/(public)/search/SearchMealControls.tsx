"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SearchFilterBar,
  type FilterConfig,
} from "@/components/shared/SearchFilterBar";
import { Pagination } from "@/components/shared/Pagination";
import type { Category } from "@/lib/types/meal";

interface SearchMealControlsProps {
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

export function SearchMealControls({
  categories,
  currentPage,
  totalPages,
  totalResults,
}: SearchMealControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");

  useEffect(() => {
    const params = searchParams ?? new URLSearchParams();
    setSearchValue(params.get("search") || params.get("q") || "");
    setCategoryValue(params.get("category") || "");
  }, [searchParams]);

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "category",
        label: "All Categories",
        options: categories.map((category) => ({
          value: category.id,
          label: category.name,
        })),
      },
    ],
    [categories],
  );

  const buildUrl = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    Object.entries(overrides).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    return `/search${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    const url = buildUrl({ search: value || null, page: "1" });
    router.push(url, { scroll: false });
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "category") {
      setCategoryValue(value);
      const url = buildUrl({ category: value || null, page: "1" });
      router.push(url, { scroll: false });
    }
  };

  const handlePageChange = (page: number) => {
    const url = buildUrl({ page: page.toString() });
    router.push(url, { scroll: false });
  };

  return (
    <div className="space-y-6 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <div className="space-y-4">
        <div className="text-sm font-black uppercase tracking-[0.35em] text-gray-400">
          Meal Search
        </div>
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search meals by name or description..."
          filters={filterConfig}
          activeFilters={{ category: categoryValue }}
          onFilterChange={handleFilterChange}
          totalResults={totalResults}
        />
      </div>

      <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
        <div className="text-xs font-black uppercase tracking-[0.28em] text-gray-500 mb-3">
          Active Filters
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <span className="font-semibold text-gray-900">Category:</span>{" "}
            {categoryValue
              ? categories.find((cat) => cat.id === categoryValue)?.name
              : "All"}
          </div>
          <div>
            <span className="font-semibold text-gray-900">Query:</span>{" "}
            {searchValue || "None"}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
