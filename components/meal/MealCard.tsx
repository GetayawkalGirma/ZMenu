"use client";

import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui";
import Link from "next/link";
import { 
  Sparkles, 
  Utensils, 
  Flame, 
  Users, 
  Clock, 
  ChevronRight,
  BarChart2
} from "lucide-react";

export function MealCard({ meal, onEdit, onDelete, showActions = true }: any) {
  // Portion label (kept for variants)
  const getPortionLabel = (portion: any) => {
    if (!portion) return null;
    switch (portion) {
      case "ONE_PERSON": return "Single";
      case "TWO_PEOPLE": return "Couple";
      case "THREE_PEOPLE": return "Group";
      case "FAMILY": return "Family";
      default: return portion;
    }
  };

  // Image handling
  const imageSrc =
    meal.imageUrl ||
    (meal.image instanceof File ? URL.createObjectURL(meal.image) : null);

  // Detect global vs restaurant-specific
  const isGlobal = !meal.price && (meal.minPrice || meal.maxPrice);

  // Price display logic
  const displayPrice = isGlobal
    ? meal.minPrice === meal.maxPrice
      ? formatPrice(meal.minPrice)
      : `${formatPrice(meal.minPrice)} — ${formatPrice(meal.maxPrice)}`
    : formatPrice(meal.price || 0);

  const categoryName = meal.category?.name || meal.categoryId || "Premium Dish";
  const portionLabel = getPortionLabel(meal.portionSize);

  return (
    <Link href={`/meals/${meal.id}`} className="block group h-full">
      <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full relative">
        {/* Full-width Top Image */}
        <div className="h-56 w-full bg-gray-50 flex-shrink-0 relative overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={meal.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Premium+Meal";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200">
              <Utensils className="w-10 h-10 opacity-20" />
            </div>
          )}
          {meal.isPopular && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-xl flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-white" /> Trending
            </div>
          )}
        </div>

        {/* Spacious Content Area */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-5">
            {/* Header Area */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                    {categoryName}
                  </span>
                  {meal.spicyLevel > 0 && (
                    <div className="flex items-center text-orange-600 text-[10px] font-black uppercase tracking-tight bg-orange-50 px-2 py-0.5 rounded-md">
                      <Flame className="w-3 h-3 mr-1" /> Heat {meal.spicyLevel}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-start flex-wrap gap-4">
                <h3 className="text-xl font-black text-gray-900 leading-tight tracking-tighter uppercase group-hover:text-indigo-600 transition-colors flex-1 min-w-[200px]">
                  {meal.restName || meal.name}
                </h3>

                <div className="px-4 py-2 bg-zinc-900 text-white rounded-xl shadow-lg group-hover:bg-indigo-600 transition-all duration-500 flex flex-col items-end">
                   <span className="text-[8px] font-black opacity-50 uppercase tracking-widest leading-none mb-1">
                      {isGlobal ? "Value Range" : "Price"}
                   </span>
                   <span className="text-sm font-black tracking-tighter whitespace-nowrap">
                      {displayPrice}
                   </span>
                </div>
              </div>
            </div>

            {/* Description Details */}
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-full break-words">
              {meal.restDescription || meal.description || "A masterfully selected dish featuring premium ingredients and traditional preparation."}
            </p>

            {/* Analytics & Tags */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {meal.tags?.slice(0, 4).map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-[9px] font-black text-gray-400 rounded-md uppercase tracking-tight transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-400">
                  #{tag}
                </span>
              ))}
              {isGlobal && meal.avgPrice && (
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  <BarChart2 className="w-3 h-3 mr-1.5 text-indigo-400" />
                  Avg {formatPrice(meal.avgPrice)}
                </div>
              )}
            </div>
          </div>

          {/* Footer Utilities */}
          <div className="mt-6 pt-5 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {isGlobal ? (
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">
                    {meal.priceCount || 1} Locations
                  </span>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Available At</span>
                </div>
              ) : portionLabel ? (
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight flex items-center">
                    <Users className="w-3 h-3 mr-1.5 text-indigo-400" /> {portionLabel}
                  </span>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Portion</span>
                </div>
              ) : null}

              {meal.preparationTime && (
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight flex items-center">
                    <Clock className="w-3 h-3 mr-1.5 text-emerald-400" /> {meal.preparationTime} Min
                  </span>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Prep Time</span>
                </div>
              )}
            </div>

            <div className="flex items-center shrink-0 px-5 py-2.5 bg-zinc-900 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-md group-hover:bg-indigo-600 transition-all active:scale-95 whitespace-nowrap">
              Explore <ChevronRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Dashboard Tools */}
        {showActions && (onEdit || onDelete) && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 flex-wrap">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-black uppercase text-[10px] tracking-widest h-10 px-6 border-gray-200 hover:border-black transition-all shrink-0"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(meal); }}
              >
                Modify
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-black uppercase text-[10px] tracking-widest h-10 px-6 text-red-500 border-red-100 hover:bg-red-50 transition-all shrink-0"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(meal.id); }}
              >
                Archive
              </Button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
