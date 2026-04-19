"use client";

import { MenuItem } from "@/lib/types/meal";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { Tag, BarChart2, Pizza } from "lucide-react";

import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  menuItem: MenuItem;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function MenuItemCard({
  menuItem,
  onEdit,
  onDelete,
  className,
}: MenuItemCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-xl transition-all duration-300 group border-gray-100 rounded-2xl sm:rounded-3xl flex flex-col",
        className,
      )}
    >
      {/* Image Section */}
      <Link href={`/admin/meals/${menuItem.id}`}>
        <div className="relative h-28 sm:h-44 w-full bg-gray-50 overflow-hidden cursor-pointer">
          {(menuItem as any).imageUrl ? (
            <img
              src={(menuItem as any).imageUrl}
              alt={menuItem.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400?text=No+Image";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50 border-b border-gray-50">
              <Pizza className="w-6 h-6 sm:w-8 sm:h-8 opacity-20" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                No Photo
              </span>
            </div>
          )}

          {/* Overlay for actions if needed */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
        </div>
      </Link>

      <CardHeader className="p-3 sm:p-5 pb-1 sm:pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/admin/meals/${menuItem.id}`}>
              <CardTitle className="text-xs sm:text-xl font-black text-gray-900 truncate uppercase hover:text-blue-600 transition-colors cursor-pointer">
                {menuItem.name}
              </CardTitle>
            </Link>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5"
              >
                {menuItem.category?.name || "Uncat"}
              </Badge>
              {menuItem.type && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  {menuItem.type}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(menuItem);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit Global Item"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(menuItem.id);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Global Item"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
      </CardHeader>

      <CardContent className="p-3 sm:p-5 pt-0 sm:pt-0 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {menuItem.description && (
            <p className="text-[10px] sm:text-sm text-gray-500 line-clamp-2 italic leading-relaxed">
              "{menuItem.description}"
            </p>
          )}

          {/* Analytics Summary */}
          <div className="grid grid-cols-2 gap-1.5 p-2 bg-gray-50/50 rounded-xl border border-gray-50">
            <div className="text-center border-r border-gray-100 pr-1.5">
              <div className="text-[7px] sm:text-[9px] uppercase tracking-widest text-gray-400 font-black mb-0.5">
                Avg
              </div>
              <div className="text-[10px] sm:text-sm font-black text-gray-900">
                {menuItem.avgPrice ? formatPrice(menuItem.avgPrice) : "—"}
              </div>
            </div>
            <div className="text-center pl-1.5">
              <div className="text-[7px] sm:text-[9px] uppercase tracking-widest text-gray-400 font-black mb-0.5">
                Venues
              </div>
              <div className="text-[10px] sm:text-sm font-black text-gray-900">
                {menuItem.priceCount || 0}
              </div>
            </div>
          </div>

          {/* Tags */}
          {menuItem.tags && menuItem.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {menuItem.tags.slice(0, 3).map((tag) => (
                <div
                  key={tag}
                  className="flex items-center text-[7px] sm:text-[9px] bg-white border border-gray-100 px-1.5 py-0.5 rounded-md text-gray-400 font-bold uppercase tracking-widest"
                >
                  <Tag className="w-2 h-2 mr-1 opacity-50" />
                  {tag}
                </div>
              ))}
              {menuItem.tags.length > 3 && (
                <span className="text-[7px] sm:text-[9px] text-gray-300 font-black uppercase tracking-widest self-center ml-1">
                  +{menuItem.tags.length - 3}
                </span>
              )}
            </div>
          ) : (
            <div className="text-[7px] sm:text-[9px] text-gray-300 font-black uppercase tracking-widest flex items-center italic">
              <Tag className="w-2 h-2 mr-1 opacity-30" />
              No tags
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Removed local cn function
