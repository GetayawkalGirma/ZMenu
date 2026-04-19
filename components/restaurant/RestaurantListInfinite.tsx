"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { getRestaurantsAction } from "@/app/(public)/restaurants/actions";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";

export function RestaurantListInfinite({ 
  initialItems, 
  initialTotal 
}: { 
  initialItems: any[], 
  initialTotal: number 
}) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length < initialTotal);
  const observerTarget = useRef(null);

  // Filters from URL - Guarded against null
  const search = searchParams?.get("search") || undefined;
  const categories = searchParams?.get("categories")?.split(",").filter(Boolean);
  const features = searchParams?.get("features")?.split(",").filter(Boolean);
  const sortBy = searchParams?.get("sortBy") || "recommended";

  // Reset when filters change
  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialItems.length < initialTotal);
  }, [initialItems, initialTotal]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    
    const result = await getRestaurantsAction({
      page: nextPage,
      pageSize: 6, // 6 items at a time as requested
      search,
      categoryNames: categories,
      featureNames: features,
      sortBy,
      // status: "PUBLISHED" is already hardcoded in the server action
    });

    if (result.success && result.data) {
      const newItems = result.data.items;
      setItems((prev) => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(items.length + newItems.length < result.data.total);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [page, loading, hasMore, search, categories, features, sortBy, items.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
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
      <div className="col-span-full py-20 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-gray-100 p-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 text-gray-200" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">No results found</h3>
        <p className="text-gray-400 font-medium text-xs sm:text-sm max-w-xs mx-auto mb-8">
          Try adjusting your filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
        {items.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-12">
          {loading && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-12">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">You've reached the end</p>
        </div>
      )}
    </div>
  );
}
