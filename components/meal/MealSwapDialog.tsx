"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from "@/components/ui";
import { Search, ArrowLeftRight } from "lucide-react";
import type { MenuItem } from "@/lib/types/meal";
import { MenuItemSearch } from "./MenuItemSearch";
import { swapMealMenuItem } from "@/app/admin/restaurant-management/menu-item-actions";

interface MealSwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantMenuId: string;
  mealName: string;
  currentMenuItemId?: string;
  onSuccess: () => void;
}

export function MealSwapDialog({
  open,
  onOpenChange,
  restaurantMenuId,
  mealName,
  currentMenuItemId,
  onSuccess,
}: MealSwapDialogProps) {
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    if (!selectedMenuItem) return;
    setLoading(true);
    try {
      const result = await swapMealMenuItem(restaurantMenuId, selectedMenuItem.id);
      if (result.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        alert(result.error || "Failed to swap meal type");
      }
    } catch (err) {
      console.error(err);
      alert("A communication error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            Swap Global Menu Item
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Re-link <span className="font-bold text-gray-900">"{mealName}"</span> to a different item in the Global Menu. 
            This will change its category and global properties.
          </p>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Search for new meal type
            </label>
            <MenuItemSearch 
              onSelect={setSelectedMenuItem}
              selectedItem={selectedMenuItem}
              onClear={() => setSelectedMenuItem(null)}
            />
          </div>

          {selectedMenuItem && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-tight">New Target</p>
                <h4 className="font-bold text-blue-900">{selectedMenuItem.name}</h4>
                <p className="text-[10px] text-blue-500">Category: {selectedMenuItem.category?.name || "Global"}</p>
              </div>
              <ArrowLeftRight className="h-4 w-4 text-blue-300" />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between items-center border-t pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSwap} 
            disabled={loading || !selectedMenuItem || selectedMenuItem.id === currentMenuItemId}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            {loading ? "Swapping..." : "Confirm Swap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
