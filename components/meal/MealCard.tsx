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
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full relative">
        {/* Full-width Top Image */}
        <div className="aspect-square sm:h-56 w-full bg-gray-50 flex-shrink-0 relative overflow-hidden">
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
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-indigo-600 text-white text-[7px] sm:text-[9px] font-black rounded-md sm:rounded-lg uppercase tracking-widest shadow-xl flex items-center gap-1">
              <Sparkles className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 fill-white" /> <span className="hidden xs:inline">Trending</span>
            </div>
          )}
        </div>

        {/* Compact Content Area */}
        <div className="p-3 sm:p-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-2 sm:space-y-5">
            {/* Header Area */}
            <div className="flex flex-col gap-1 sm:gap-3">
              <div className="flex justify-between items-start flex-wrap gap-1 sm:gap-2">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <span className="text-[8px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-[0.1em] sm:tracking-[0.2em] truncate max-w-[60px] sm:max-w-none">
                    {categoryName}
                  </span>
                  {meal.spicyLevel > 0 && (
                    <div className="flex items-center text-orange-600 text-[8px] sm:text-[10px] font-black uppercase tracking-tight bg-orange-50 px-1 py-0.5 sm:px-2 sm:py-0.5 rounded-md">
                      <Flame className="w-2.5 sm:w-3 h-2.5 sm:w-3 mr-0.5 sm:mr-1" /> <span className="hidden xs:inline">Heat</span> {meal.spicyLevel}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-start flex-wrap gap-2 sm:gap-4">
                <h3 className="text-xs sm:text-xl font-black text-gray-900 leading-tight tracking-tighter uppercase group-hover:text-indigo-600 transition-colors flex-1 line-clamp-2">
                  {meal.restName || meal.name}
                </h3>

                <div className="px-1.5 py-1 sm:px-4 sm:py-2 bg-zinc-900 text-white rounded-lg sm:rounded-xl shadow-lg group-hover:bg-indigo-600 transition-all duration-500 flex flex-col items-end">
                   <span className="text-[6px] sm:text-[8px] font-black opacity-50 uppercase tracking-widest leading-none mb-0.5 sm:mb-1 hidden sm:block">
                      {isGlobal ? "Value Range" : "Price"}
                   </span>
                   <span className="text-[9px] sm:text-sm font-black tracking-tighter whitespace-nowrap">
                      {displayPrice}
                   </span>
                </div>
              </div>
            </div>

            {/* Description Details - Hidden on Mobile */}
            <p className="hidden sm:block text-sm text-gray-500 font-medium leading-relaxed max-w-full break-words line-clamp-2">
              {meal.restDescription || meal.description || "A masterfully selected dish featuring premium ingredients."}
            </p>

            {/* Analytics & Tags - Hidden/Simplified on Mobile */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-3 pt-1 sm:pt-2">
              {meal.tags?.slice(0, 2).map((tag: string) => (
                <span key={tag} className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-gray-50 border border-gray-100 text-[7px] sm:text-[9px] font-black text-gray-400 rounded-md uppercase tracking-tight transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-400">
                  #{tag}
                </span>
              ))}
              {isGlobal && meal.avgPrice && (
                <div className="text-[7px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center bg-gray-50 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-gray-100">
                  <BarChart2 className="w-2 sm:w-3 h-2 sm:w-3 mr-1 sm:mr-1.5 text-indigo-400" />
                  <span className="hidden xs:inline">Avg</span> {formatPrice(meal.avgPrice)}
                </div>
              )}
            </div>
          </div>

          {/* Footer Utilities - Very Compact on Mobile */}
          <div className="mt-2 sm:mt-6 pt-2 sm:pt-5 border-t border-gray-50 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-6">
              {isGlobal ? (
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[11px] font-black text-gray-900 uppercase tracking-tight">
                    {meal.priceCount || 1} Locs
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">Available At</span>
                </div>
              ) : portionLabel ? (
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[11px] font-black text-gray-900 uppercase tracking-tight flex items-center">
                    <Users className="w-2.5 sm:w-3 h-2.5 sm:w-3 mr-1 sm:mr-1.5 text-indigo-400" /> {portionLabel}
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">Portion</span>
                </div>
              ) : null}

              {meal.preparationTime && (
                <div className="hidden xs:flex flex-col">
                  <span className="text-[9px] sm:text-[11px] font-black text-gray-900 uppercase tracking-tight flex items-center">
                    <Clock className="w-2.5 sm:w-3 h-2.5 sm:w-3 mr-1 sm:mr-1.5 text-emerald-400" /> {meal.preparationTime}m
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">Prep Time</span>
                </div>
              )}
            </div>

            <div className="flex items-center shrink-0 px-2 py-1.5 sm:px-5 sm:py-2.5 bg-zinc-900 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-md group-hover:bg-indigo-600 transition-all active:scale-95 whitespace-nowrap">
              <span className="hidden xs:inline">Info</span> <ChevronRight className="w-2.5 sm:w-3.5 h-2.5 sm:w-3.5 ml-1 sm:ml-1.5 group-hover:translate-x-1 transition-transform" />
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
