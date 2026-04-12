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
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 flex flex-col h-full relative">
        
        {/* Visual Header */}
        <div className="h-64 w-full bg-gray-50 flex-shrink-0 relative overflow-hidden">
          <img
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          
          {/* Top Overlays */}
          <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              {item.isPopular && (
                <div className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black rounded-xl uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-white" /> Popular
                </div>
              )}
              {item.dietaryCategory === "YETSOM" ? (
                <div className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black rounded-xl uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 fill-white" /> Fasting
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-red-500 text-white text-[9px] font-black rounded-xl uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                  <Beef className="w-3.5 h-3.5 fill-white" /> Non-Fasting
                </div>
              )}
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl shadow-2xl flex flex-col items-end">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</span>
              <span className="text-lg font-black text-gray-900 tracking-tighter">
                {formatPrice(item.price)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 flex-1 flex flex-col">
          <div className="flex-1 space-y-4">
            {/* Identity & Venue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                    {categoryName}
                  </span>
                  {spicyLevel > 0 && (
                    <div className="flex items-center text-orange-600 text-[10px] font-black uppercase tracking-tight bg-orange-50 px-2.5 py-1 rounded-lg">
                      <Flame className="w-3.5 h-3.5 mr-1 text-orange-500" /> Heat {spicyLevel}
                    </div>
                  )}
                </div>

                <div className="flex items-center text-gray-400 font-black text-[9px] uppercase tracking-widest bg-gray-50/50 px-2.5 py-1.5 rounded-xl border border-gray-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                   <Store className="w-3 h-3 mr-1.5 text-indigo-400" />
                   {restaurantName}
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900 leading-tight tracking-tighter uppercase group-hover:text-indigo-600 transition-colors">
                  {item.name || item.menuItem?.name || "Unnamed Dish"}
                </h3>
              </div>
            </div>

            {/* Description Area */}
            <div className="space-y-2">
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

          {/* High-Density Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-6">
            <div className="flex items-center space-x-10">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight flex items-center">
                  <ChefHat className="w-4 h-4 mr-2 text-indigo-400" /> {item.portionSize || "Single"}
                </span>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Portion Info</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 rounded-[1.5rem] text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl group-hover:bg-indigo-600 transition-all active:scale-95">
              Explore <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
