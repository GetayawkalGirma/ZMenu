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
        
        {/* Visual Header - High Density for 2-column mobile */}
        <div className="aspect-square w-full bg-gray-50 flex-shrink-0 relative overflow-hidden">
          <img
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          
          {/* Price Overlay - Always visible but compact on mobile */}
          <div className="absolute top-2 right-2 sm:top-5 sm:right-5 bg-white/95 backdrop-blur-md border border-white/20 px-2 py-1 sm:px-5 sm:py-3 rounded-lg sm:rounded-2xl shadow-xl flex flex-col items-end">
            <span className="text-[6px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest hidden sm:block mb-1">Price</span>
            <span className="text-[9px] sm:text-lg font-black text-gray-900 tracking-tighter">
              {formatPrice(item.price)}
            </span>
          </div>
        </div>

        <div className="p-2 sm:p-8 flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-2 sm:space-y-4">
            {/* Identity & Venue */}
            <div className="space-y-1 sm:space-y-3">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-[7px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest sm:tracking-[0.2em] whitespace-nowrap">
                    {categoryName}
                  </span>
                  {spicyLevel > 0 && (
                    <div className="flex items-center text-orange-600 text-[7px] sm:text-[10px] font-black uppercase tracking-tight bg-orange-50 px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">
                      <Flame className="w-2 sm:w-3.5 h-2 sm:h-3.5 mr-0.5 sm:mr-1 text-orange-500" /> {spicyLevel}
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-[10px] sm:text-2xl font-black text-gray-900 leading-tight tracking-tighter uppercase group-hover:text-indigo-600 transition-colors sm:line-clamp-none line-clamp-2 overflow-hidden">
                {item.name || item.menuItem?.name || "Unnamed Dish"}
              </h3>

              <div className="flex items-center text-gray-400 font-black text-[7px] sm:text-[9px] uppercase tracking-widest bg-gray-50/50 px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-xl border border-gray-100 truncate">
                 <Store className="w-2 sm:w-3 h-2 sm:w-3 mr-1 sm:mr-1.5 text-indigo-400" />
                 {restaurantName}
              </div>
            </div>

            {/* Description Area - Hidden on Mobile */}
            <div className="hidden sm:block space-y-2">
              <p className="text-base text-gray-400 font-medium leading-relaxed italic sm:line-clamp-none line-clamp-2">
                {item.description || item.menuItem?.description || "A taste of excellence from their master chef."}
              </p>
            </div>
          </div>

          {/* Compact Footer */}
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100 flex items-center justify-between gap-2 sm:gap-6">
            <div className="flex items-center">
              <span className="text-[8px] sm:text-[11px] font-black text-gray-900 uppercase tracking-tight flex items-center">
                <ChefHat className="w-2.5 sm:w-4 h-2.5 sm:h-4 mr-1 sm:mr-2 text-indigo-400" /> {item.portionSize || "Single"}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-3 px-2 py-1 sm:px-6 sm:py-3 bg-zinc-900 rounded-lg sm:rounded-[1.5rem] text-[7px] sm:text-[10px] font-black text-white uppercase tracking-widest sm:tracking-[0.2em] shadow-xl group-hover:bg-indigo-600 transition-all active:scale-95">
              <span className="hidden xs:inline">Order</span> <ChevronRight className="w-2 sm:w-4 h-2 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
