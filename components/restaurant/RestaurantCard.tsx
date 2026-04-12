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
    <Card className={cn(
      "group relative overflow-hidden border-0 bg-white transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl",
      "flex flex-col md:flex-row h-full md:h-64",
      className
    )}>
      {/* Left: Premium Image Section */}
      <div className="relative w-full md:w-72 shrink-0 overflow-hidden bg-gray-50">
        <img 
          src={restaurant.logoUrl || "https://placehold.co/600x400?text=No+Photo"} 
          alt={restaurant.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Floating Feature Overlay */}
        {features.length > 0 && (
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1 bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm border border-white/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              {features[0]}
            </div>
          </div>
        )}
      </div>

      {/* Right: Clean Info Section */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase group-hover:text-blue-600 transition-colors leading-tight">
              {restaurant.name}
            </h3>
            <div className="flex items-center text-xs text-gray-400 font-medium tracking-tight">
              <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500/50" />
              {restaurant.location || "Addis Ababa"}
            </div>
          </div>

          {/* Pricing & Features */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Pricing */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Avg Price</span>
                <span className="text-sm font-black text-gray-900">
                  {restaurant.avgPrice ? `ETB ${Math.round(restaurant.avgPrice)}` : "—"}
                </span>
              </div>
            </div>

            {/* Feature Count */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <UtensilsCrossed className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">Variety</span>
                <span className="text-sm font-black text-gray-900">{restaurant.mealCount || 0} Items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-4">
          <div className="flex gap-2">
            {cats.slice(0, 1).map((cat) => (
              <span key={cat} className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[9px] font-black rounded-lg uppercase tracking-wider border border-gray-100">
                {cat}
              </span>
            ))}
          </div>
          
          <Link href={`/restaurants/${restaurant.id}`}>
            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 group/btn">
              Explore Menu
              <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Modern Lift Background (Top right accent) */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full blur-3xl -mr-12 -mt-12 transition-colors group-hover:bg-blue-100/50 duration-500" />
    </Card>
  );
}
