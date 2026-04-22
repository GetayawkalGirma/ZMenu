"use client";

import { RestaurantMenu, MenuItem } from "@/lib/types/meal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { Clock, Users, Flame, Star, Image as ImageIcon, ArrowLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { useState } from "react";
import { MealSwapDialog } from "./MealSwapDialog";
import { MealImageSwapDialog } from "./MealImageSwapDialog";

interface RestaurantMenuCardProps {
  restaurantId: string;
  restaurantMenu: RestaurantMenu;
  onEdit?: (item: RestaurantMenu) => void;
  onDelete?: (id: string) => void;
  onChangeCategory?: () => void;
  className?: string;
}

export function RestaurantMenuCard({
  restaurantId,
  restaurantMenu,
  onEdit,
  onDelete,
  onChangeCategory,
  className,
}: RestaurantMenuCardProps) {
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const item = restaurantMenu.menuItem;
  const restaruantsmeal = restaurantMenu.name;

  return (
    <Card
      className={cn(
        "relative overflow-hidden group hover:shadow-xl transition-all duration-300",
        className,
      )}
    >
      <MealSwapDialog 
        open={showSwapDialog}
        onOpenChange={setShowSwapDialog}
        restaurantMenuId={restaurantMenu.id}
        mealName={restaruantsmeal || "Item"}
        currentMenuItemId={item?.id}
        onSuccess={() => {
          if (onChangeCategory) onChangeCategory();
        }}
      />
      <MealImageSwapDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        restaurantId={restaurantId}
        restaurantMenuId={restaurantMenu.id}
        mealName={restaruantsmeal || "Item"}
        currentImageId={restaurantMenu.imageId}
        onSuccess={() => {
          if (onChangeCategory) onChangeCategory();
        }}
      />
      {/* Featured Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {restaurantMenu.isPopular && (
          <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center">
            <Flame className="w-2.5 h-2.5 mr-1" /> POPULAR
          </div>
        )}
        {restaurantMenu.isRecommended && (
          <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center">
            <Star className="w-2.5 h-2.5 mr-1" /> RECOMENDED
          </div>
        )}
      </div>

      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {restaurantMenu.imageUrl ? (
          <img
            src={restaurantMenu.imageUrl}
            alt={item?.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 11 4-7" />
              <path d="m19 11-4-7" />
              <path d="M2 11h20" />
              <path d="m3.5 11 1.6 7.4c.2.8.9 1.2 1.7 1.2h10.4c.8 0 1.5-.4 1.7-1.2l1.6-7.4" />
              <path d="m9 11 1 9" />
              <path d="m15 11-1 9" />
            </svg>
          </div>
        )}

        {/* Availability Overlay */}
        {!restaurantMenu.isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-bold tracking-widest text-sm uppercase px-3 py-1 border-2 border-white/40 rounded">
              Sold Out
            </span>
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowImageDialog(true)}
            className="p-2 bg-white/90 hover:bg-white text-emerald-600 rounded-full shadow-md transition-colors"
            title="Swap Image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowSwapDialog(true)}
            className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-full shadow-md transition-colors"
            title="Swap Menu Item"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(restaurantMenu)}
              className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(restaurantMenu.id)}
              className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          )}
        </div>
      </div>



      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
              {restaruantsmeal || "Unknown Item"}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium">
              {item?.category?.name || "Global Menu"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-orange-600 leading-none">
              {formatPrice(restaurantMenu.price)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 py-2 border-t border-gray-50">
          <div className="flex items-center text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
            <Users className="w-3 h-3 mr-1 text-gray-400" />
            {restaurantMenu.portionSize?.replace("_", " ") || "Standard"}
          </div>
          <div className="flex items-center text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
            <Clock className="w-3 h-3 mr-1 text-gray-400" />
            {restaurantMenu.preparationTime || 15} MIN
          </div>
          {restaurantMenu.spicyLevel !== null &&
            restaurantMenu.spicyLevel !== undefined &&
            restaurantMenu.spicyLevel > 0 && (
              <div className="flex items-center text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                <Flame className="w-3 h-3 mr-1" />
                LVL {restaurantMenu.spicyLevel}
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

// Removed local cn function
