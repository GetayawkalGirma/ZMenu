"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MealCard } from "@/components/meal/MealCard";
import { getMenuItemsAction } from "./actions";
import { Loader2, UtensilsCrossed } from "lucide-react";

export function SearchMealInfinite({
  initialItems,
  initialTotal,
}: {
  initialItems: any[];
  initialTotal: number;
}) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length < initialTotal);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const search = searchParams?.get("search") || undefined;
  const categories = searchParams
    ?.get("categories")
    ?.split(",")
    .filter(Boolean);
  const types = searchParams?.get("types")?.split(",").filter(Boolean);
  const nearMe = searchParams?.get("nearMe") === "true";
  const userLat = searchParams?.get("lat")
    ? parseFloat(searchParams.get("lat")!)
    : undefined;
  const userLng = searchParams?.get("lng")
    ? parseFloat(searchParams.get("lng")!)
    : undefined;
  const queryString = searchParams?.toString() || "";

  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialItems.length < initialTotal);
  }, [initialItems, initialTotal, queryString]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    const result = await getMenuItemsAction({
      page: nextPage,
      pageSize: 9,
      search,
      categoryNames: categories,
      foodCategoryTypes: types,
      nearMe,
      userLat,
      userLng,
    });

    if (result && result.items) {
      setItems((prev) => [...prev, ...result.items]);
      setPage(nextPage);
      setHasMore(items.length + result.items.length < result.total);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [
    page,
    loading,
    hasMore,
    search,
    categories,
    types,
    nearMe,
    userLat,
    userLng,
    items.length,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore, hasMore, loading]);

  if (items.length === 0 && !loading) {
    return (
      <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center">
          <UtensilsCrossed className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">
          No meals found
        </h3>
        <p className="text-sm text-gray-500">
          Try adjusting filters or search terms to see more meals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
        {items.map((meal) => (
          <MealCard key={meal.id} meal={meal} showActions={false} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-10">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Loading more meals...
              </span>
            </div>
          ) : (
            <div className="h-12" />
          )}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-10 text-[10px] font-black uppercase tracking-widest text-gray-300">
          You’ve reached the end of the meal list.
        </div>
      )}
    </div>
  );
}
