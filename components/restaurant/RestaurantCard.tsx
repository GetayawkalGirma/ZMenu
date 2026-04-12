"use client";

import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { MapPin, UtensilsCrossed, ChevronRight, DollarSign, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    logoUrl?: string;
    location?: string;
    featureLabels?: string[];
    categories?: string[];
    mealCount?: number;
    avgPrice?: number;
  };
  className?: string;
}

export function RestaurantCard({ restaurant, className }: RestaurantCardProps) {
  const features = restaurant.featureLabels || [];
  const cats = restaurant.categories || [];
  
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="block h-full cursor-pointer">
      <Card className={cn(
        "group relative overflow-hidden border-0 bg-white transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] rounded-[2.5rem] flex flex-col h-full",
        className
      )}>
        {/* Top: Premium Image Section */}
        <div className="relative h-64 overflow-hidden bg-gray-50 flex-shrink-0">
          <img 
            src={restaurant.logoUrl || "https://placehold.co/600x400?text=No+Photo"} 
            alt={restaurant.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          
          {/* Floating Feature Overlay */}
          {features.length > 0 && (
            <div className="absolute top-6 left-6">
              <div className="px-4 h-8 bg-white/95 backdrop-blur-md text-blue-600 text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl border border-white/20 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {features[0]}
              </div>
            </div>
          )}
          
          {/* Gradient Fade to Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Bottom: Clean Info Section */}
        <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase group-hover:text-blue-600 transition-colors leading-[0.85]">
                {restaurant.name}
              </h3>
              <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5 mr-2 text-blue-500/30" />
                {restaurant.location || "Addis Ababa"}
              </div>
            </div>

            {/* Pricing & Features Grid */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-50">
              {/* Pricing */}
              <div className="space-y-1">
                  <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest">Price Point</span>
                  <span className="text-lg font-black text-gray-900 tabular-nums">
                    {restaurant.avgPrice ? `ETB ${Math.round(restaurant.avgPrice)}` : "—"}
                  </span>
              </div>

              {/* Feature Count */}
              <div className="space-y-1 text-right">
                  <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest">Cuisine Index</span>
                  <span className="text-lg font-black text-blue-600">{restaurant.mealCount || 0} Items</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {cats.slice(0, 1).map((cat) => (
                <span key={cat} className="px-3 py-1.5 bg-blue-50/50 text-blue-600 text-[9px] font-black rounded-lg uppercase tracking-widest">
                  {cat}
                </span>
              ))}
            </div>
            
            <div className="h-10 px-0 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 flex items-center group-hover:text-blue-600 transition-colors">
              Menu
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Modern Lift Background (Top right accent) */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full blur-3xl -mr-12 -mt-12 transition-colors group-hover:bg-blue-100/50 duration-500" />
      </Card>
    </Link>
  );
}
