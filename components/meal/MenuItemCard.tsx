"use client";

import { MenuItem } from "@/lib/types/meal";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Badge,
} from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { Tag, BarChart2 } from "lucide-react";

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
    <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300 group border-gray-200", className)}>
      {/* Image Section */}
      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
        {(menuItem as any).imageUrl ? (
          <img
            src={(menuItem as any).imageUrl}
            alt={menuItem.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-b border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-widest opacity-40">No Photo</span>
          </div>
        )}
        
        {/* Overlay for actions if needed */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
      </div>

      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {menuItem.name}
            </CardTitle>
            <div className="mt-1">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100">
                {menuItem.category?.name || "Uncategorized"}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button 
                onClick={() => onEdit(menuItem)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit Global Item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(menuItem.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Global Item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {menuItem.description && (
          <p className="text-sm text-gray-600 line-clamp-2 italic">
            "{menuItem.description}"
          </p>
        )}

        {/* Analytics Summary */}
        <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-center border-r border-gray-200">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Avg Price</div>
            <div className="text-sm font-bold text-gray-900">
              {menuItem.avgPrice ? formatPrice(menuItem.avgPrice) : "—"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Restaurants</div>
            <div className="text-sm font-bold text-gray-900">
              {menuItem.priceCount || 0}
            </div>
          </div>
        </div>

        {/* Tags */}
        {menuItem.tags && menuItem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {menuItem.tags.map((tag) => (
              <div key={tag} className="flex items-center text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 font-medium">
                <Tag className="w-2.5 h-2.5 mr-1 opacity-60" />
                {tag}
              </div>
            ))}
          </div>
        )}
        
        {(!menuItem.tags || menuItem.tags.length === 0) && (
          <div className="text-[10px] text-gray-400 font-medium flex items-center">
            <Tag className="w-2.5 h-2.5 mr-1" />
            No tags assigned
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Removed local cn function
