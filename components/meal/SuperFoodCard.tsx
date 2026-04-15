"use client";

import { formatPrice } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import Link from "next/link";
import { 
  Sparkles, 
  Utensils, 
  Flame, 
  ChevronRight,
  Store,
  Leaf,
  Beef,
  ChefHat,
  MapPin
} from "lucide-react";

export function SuperFoodCard({ item }: { item: any }) {
  const imageSrc =
    item.imageUrl ||
    item.menuItem?.imageUrl ||
    "https://placehold.co/600x400?text=Premium+Meal";

  const restaurantName = item.restaurant?.name || "Unknown Venue";
  const categoryName = item.menuItem?.category?.name || "Premium Dish";
  const spicyLevel = item.spicyLevel || item.menuItem?.spicyLevel || 0;
  
  return (
    <Link href={`/restaurants/${item.restaurantId}`} className="block group h-full">
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2.5rem] overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 flex flex-col h-full relative">
        
        {/* Visual Header */}
        <div className="aspect-square sm:h-64 w-full bg-gray-50 flex-shrink-0 relative overflow-hidden">
          <img
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          
          {/* Top Overlays - Compact on Mobile */}
          <div className="absolute top-2 left-2 right-2 sm:top-5 sm:left-5 sm:right-5 flex justify-between items-start">
            <div className="flex flex-col gap-1 sm:gap-2">
              {item.isPopular && (
                <div className="px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-indigo-600 text-white text-[7px] sm:text-[9px] font-black rounded-md sm:rounded-xl uppercase tracking-widest shadow-xl flex items-center gap-1">
                  <Sparkles className="w-2 sm:w-3.5 h-2 sm:h-3.5 fill-white" /> <span className="hidden xs:inline">Popular</span>
                </div>
              )}
              {item.dietaryCategory === "YETSOM" ? (
                <div className="px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-emerald-500 text-white text-[7px] sm:text-[9px] font-black rounded-md sm:rounded-xl uppercase tracking-widest shadow-xl flex items-center gap-1">
                  <Leaf className="w-2 sm:w-3.5 h-2 sm:h-3.5 fill-white" /> <span className="hidden xs:inline">Fasting</span>
                </div>
              ) : (
                <div className="px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-red-500 text-white text-[7px] sm:text-[9px] font-black rounded-md sm:rounded-xl uppercase tracking-widest shadow-xl flex items-center gap-1">
                  <Beef className="w-2 sm:w-3.5 h-2 sm:h-3.5 fill-white" /> <span className="hidden xs:inline">Non-Fasting</span>
                </div>
              )}
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-white/20 px-2 py-1 sm:px-5 sm:py-3 rounded-lg sm:rounded-2xl shadow-xl sm:shadow-2xl flex flex-col items-end">
              <span className="text-[6px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest hidden sm:block mb-1">Price</span>
              <span className="text-[10px] sm:text-lg font-black text-gray-900 tracking-tighter">
                {formatPrice(item.price)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-8 flex-1 flex flex-col">
          <div className="flex-1 space-y-2 sm:space-y-4">
            {/* Identity & Venue */}
            <div className="space-y-1 sm:space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-[8px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-[0.1em] sm:tracking-[0.2em] truncate max-w-[60px] sm:max-w-none">
                    {categoryName}
                  </span>
                  {spicyLevel > 0 && (
                    <div className="flex items-center text-orange-600 text-[8px] sm:text-[10px] font-black uppercase tracking-tight bg-orange-50 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">
                      <Flame className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 mr-0.5 sm:mr-1 text-orange-500" /> <span className="hidden xs:inline">Heat</span> {spicyLevel}
                    </div>
                  )}
                </div>

                <div className="flex items-center text-gray-400 font-black text-[7px] sm:text-[9px] uppercase tracking-widest bg-gray-50/50 px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-xl border border-gray-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors truncate max-w-[80px] sm:max-w-none">
                   <Store className="w-2 sm:w-3 h-2 sm:w-3 mr-1 sm:mr-1.5 text-indigo-400" />
                   {restaurantName}
                </div>
              </div>
              
              <div className="space-y-0.5 sm:space-y-1">
                <h3 className="text-xs sm:text-2xl font-black text-gray-900 leading-tight tracking-tighter uppercase group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {item.name || item.menuItem?.name || "Unnamed Dish"}
                </h3>
              </div>
            </div>

            {/* Description Area - Hidden on Mobile */}
            <div className="hidden sm:block space-y-2">
              <p className="text-base text-gray-400 font-medium leading-relaxed italic line-clamp-2">
                {item.description || item.menuItem?.description || "A taste of excellence from their master chef."}
              </p>
              {item.restaurant?.location && (
                <div className="flex items-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <MapPin className="w-3 h-3 mr-1.5 text-blue-400 opacity-60" />
                  {item.restaurant.location}
                </div>
              )}
            </div>
          </div>

          {/* High-Density Footer - Very Compact on Mobile */}
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100 flex items-center justify-between gap-2 sm:gap-6">
            <div className="flex items-center space-x-2 sm:space-x-10">
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[11px] font-black text-gray-900 uppercase tracking-tight flex items-center">
                  <ChefHat className="w-2.5 sm:w-4 h-2.5 sm:h-4 mr-1 sm:mr-2 text-indigo-400" /> {item.portionSize || "Single"}
                </span>
                <span className="text-[7px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest hidden sm:block">Portion Info</span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3 px-2 py-1.5 sm:px-6 sm:py-3 bg-zinc-900 rounded-lg sm:rounded-[1.5rem] text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-xl group-hover:bg-indigo-600 transition-all active:scale-95">
              <span className="hidden xs:inline">Explore</span> <ChevronRight className="w-2.5 sm:w-4 h-2.5 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
