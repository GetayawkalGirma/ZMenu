"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SuperFoodCard } from "@/components/meal/SuperFoodCard";
import { getRestaurantMenuAction } from "@/app/(public)/restaurants/[id]/actions";
import { Loader2, UtensilsCrossed } from "lucide-react";

export function RestaurantMenuInfinite({ 
  restaurantId,
  initialItems, 
  initialTotal,
  restaurant
}: { 
  restaurantId: string;
  initialItems: any[];
  initialTotal: number;
  restaurant: any;
}) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length < initialTotal);
  const observerTarget = useRef(null);

  // Filters from URL - Added null guards to prevent build errors
  const search = searchParams?.get("search") || undefined;
  const dietary = searchParams?.get("dietary") || undefined;
  const types = searchParams?.get("types")?.split(",").filter(Boolean);
  const categories = searchParams?.get("categories")?.split(",").filter(Boolean);
  const portions = searchParams?.get("portions")?.split(",").filter(Boolean);
  const sortBy = searchParams?.get("sortBy") || "recommended";
  const spicy = searchParams?.get("spicy") ? parseInt(searchParams.get("spicy")!) : undefined;
  const minPrice = searchParams?.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
  const maxPrice = searchParams?.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;

  // Reset when initial data changes (e.g. on server navigation)
  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialItems.length < initialTotal);
  }, [initialItems, initialTotal]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    
    const result = await getRestaurantMenuAction({
      restaurantId,
      page: nextPage,
      pageSize: 6, // Changed to 6 items per load as requested
      search,
      dietaryCategory: dietary,
      foodCategoryType: types?.[0], // Simplified for now
      categoryNames: categories,
      portionSize: portions?.[0], // Fixed: Pass portion filter
      sortBy,
      spicyLevel: spicy,
      minPrice,
      maxPrice,
    });

    if (result && result.items) {
      const newItems = result.items;
      setItems((prev) => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(items.length + newItems.length < result.total);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [page, loading, hasMore, restaurantId, search, dietary, types, categories, portions, sortBy, spicy, minPrice, maxPrice, items.length]);

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
      <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 italic font-medium text-gray-400">
        <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-20" />
        No items match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
        {items.map((rm) => (
          <SuperFoodCard key={rm.id} item={{...rm, restaurant}} />
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
    </div>
  );
}
