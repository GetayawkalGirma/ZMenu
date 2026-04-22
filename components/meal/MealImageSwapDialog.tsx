"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
} from "@/components/ui";
import { Search, Image as ImageIcon } from "lucide-react";
import type { RestaurantImageOption } from "@/lib/types/meal";
import {
  getRestaurantImagePool,
  swapRestaurantMenuImage,
} from "@/app/admin/restaurant-management/menu-item-actions";

interface MealImageSwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  restaurantMenuId: string;
  mealName: string;
  currentImageId?: string | null;
  onSuccess: () => void;
}

export function MealImageSwapDialog({
  open,
  onOpenChange,
  restaurantId,
  restaurantMenuId,
  mealName,
  currentImageId,
  onSuccess,
}: MealImageSwapDialogProps) {
  const [images, setImages] = useState<RestaurantImageOption[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;
    setLoading(true);
    setError(null);

    getRestaurantImagePool(restaurantId, restaurantMenuId)
      .then((result) => {
        if (!active) return;
        if (result.success && result.data) {
          setImages(result.data);
        } else {
          setImages([]);
          setError(result.error || "Failed to load images");
        }
      })
      .catch(() => {
        if (!active) return;
        setImages([]);
        setError("Failed to load images");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, restaurantId, restaurantMenuId]);

  useEffect(() => {
    if (!open) return;
    setSelectedImageId(currentImageId || null);
    setSearch("");
  }, [open, currentImageId]);

  const filteredImages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return images;

    return images.filter((image) =>
      `${image.sourceMealName} ${image.sourceType}`
        .toLowerCase()
        .includes(query),
    );
  }, [images, search]);

  const handleSwap = async () => {
    if (!selectedImageId || selectedImageId === currentImageId) return;

    setSaving(true);
    setError(null);
    try {
      const result = await swapRestaurantMenuImage(restaurantMenuId, selectedImageId);
      if (result.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.error || "Failed to swap image");
      }
    } catch {
      setError("Failed to swap image");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            Swap Meal Image
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Pick an image already used in this restaurant for{" "}
            <span className="font-semibold text-gray-900">&quot;{mealName}&quot;</span>.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by meal name..."
              className="pl-9"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg border bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
              No reusable images found for this restaurant yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredImages.map((image) => {
                const selected = selectedImageId === image.imageId;
                const isCurrent = currentImageId === image.imageId;
                return (
                  <button
                    type="button"
                    key={image.imageId}
                    onClick={() => setSelectedImageId(image.imageId)}
                    className={`rounded-lg border text-left transition overflow-hidden ${
                      selected
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.sourceMealName}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 bg-white">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {image.sourceMealName}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                        {image.sourceType === "logo"
                          ? "Restaurant Logo"
                          : image.sourceType === "menu_image"
                            ? "Restaurant Menu Image"
                            : image.sourceType === "restaurant_menu"
                              ? "Restaurant Meal Image"
                              : image.sourceType === "global_menu_item"
                                ? "Global Linked Image"
                                : "Saved Library Image"}
                        {isCurrent ? " • Current" : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between items-center border-t pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSwap}
            disabled={
              saving ||
              !selectedImageId ||
              selectedImageId === currentImageId ||
              filteredImages.length === 0
            }
          >
            {saving ? "Updating..." : "Use Selected Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
