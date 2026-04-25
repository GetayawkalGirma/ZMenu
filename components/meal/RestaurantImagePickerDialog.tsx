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
import { getRestaurantImagePool } from "@/app/admin/restaurant-management/menu-item-actions";

interface RestaurantImagePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  title?: string;
  currentImageId?: string | null;
  onSelect: (image: RestaurantImageOption) => void;
}

export function RestaurantImagePickerDialog({
  open,
  onOpenChange,
  restaurantId,
  title = "Choose Image from Restaurant Library",
  currentImageId,
  onSelect,
}: RestaurantImagePickerDialogProps) {
  const [images, setImages] = useState<RestaurantImageOption[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;
    const loadImages = async () => {
      try {
        const result = await getRestaurantImagePool(restaurantId);
        if (!active) return;
        if (result.success && result.data) {
          setImages(result.data);
        } else {
          setImages([]);
          setError(result.error || "Failed to load image library");
        }
      } catch {
        if (!active) return;
        setImages([]);
        setError("Failed to load image library");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    void loadImages();

    return () => {
      active = false;
    };
  }, [open, restaurantId]);

  const filteredImages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return images;
    return images.filter((image) =>
      `${image.sourceMealName} ${image.sourceType} ${image.imageId}`
        .toLowerCase()
        .includes(query),
    );
  }, [images, search]);

  const handleConfirm = () => {
    if (!selectedImageId) return;
    const selected = images.find((image) => image.imageId === selectedImageId);
    if (!selected) return;
    onSelect(selected);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setLoading(true);
          setError(null);
          setSearch("");
          setSelectedImageId(currentImageId || null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID (e.g. cm...)"
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
                    className={`rounded-lg border text-left transition overflow-hidden relative group ${
                      selected
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={image.imageUrl}
                        alt={image.sourceMealName}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-[8px] font-mono text-white px-1.5 py-0.5 rounded-lg border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                        {image.imageId.slice(-6)}
                      </div>
                    </div>
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedImageId || selectedImageId === currentImageId}
          >
            Use Selected Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
