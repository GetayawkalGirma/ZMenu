"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  bulkUpdateRestaurantImages,
  deleteLibraryImage,
} from "../../../actions";
import {
  getRestaurantMenu,
  getRestaurantImagePool,
} from "../../../menu-item-actions";
import { StatusDialog, StatusType } from "@/components/ui";
import {
  ChevronLeft,
  Save,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  Star,
  Utensils,
  Coffee,
  LayoutGrid,
  Send,
  Eye,
} from "lucide-react";
import type { RestaurantMenu, RestaurantImageOption } from "@/lib/types/meal";
import Image from "next/image";
import TelegramSearchModal from "./TelegramSearchModal";

type Assignments = {
  logoId: string | null;
  menuImageId: string | null;
  meals: Record<string, string | null>;
};

function buildInitialAssignments(
  restaurant: any,
  menuItems: RestaurantMenu[]
): Assignments {
  const meals: Record<string, string | null> = {};
  menuItems.forEach((item) => { meals[item.id] = item.imageId || null; });
  return {
    logoId: restaurant.logoId || null,
    menuImageId: restaurant.menuImageId || null,
    meals,
  };
}

interface Props {
  restaurantId: string;
  initialRestaurant: any;
  initialMenuItems: RestaurantMenu[];
  initialImagePool: RestaurantImageOption[];
}

export default function ImageLibraryClient({
  restaurantId,
  initialRestaurant,
  initialMenuItems,
  initialImagePool,
}: Props) {
  const router = useRouter();

  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [menuItems, setMenuItems] = useState<RestaurantMenu[]>(initialMenuItems);
  const [imagePool, setImagePool] = useState<RestaurantImageOption[]>(initialImagePool);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignments>(
    () => buildInitialAssignments(initialRestaurant, initialMenuItems)
  );
  const [mealSearch, setMealSearch] = useState("");

  const [previewImageId, setPreviewImageId] = useState<string | null>(null);
  const previewImage = imagePool.find((img) => img.imageId === previewImageId);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<StatusType>("info");
  const [statusTitle, setStatusTitle] = useState("");
  const [statusDescription, setStatusDescription] = useState("");
  const [telegramOpen, setTelegramOpen] = useState(false);

  // Refresh button — re-fetches from server without a full page reload
  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [menuResult, poolResult] = await Promise.all([
        getRestaurantMenu(restaurantId),
        getRestaurantImagePool(restaurantId),
      ]);

      if (menuResult.success && menuResult.data) {
        const items = menuResult.data.items;
        setMenuItems(items);
        setAssignments((prev) => {
          const meals: Record<string, string | null> = {};
          items.forEach((item: RestaurantMenu) => {
            meals[item.id] = item.imageId || null;
          });
          return { ...prev, meals };
        });
      }
      if (poolResult.success && poolResult.data) {
        setImagePool(poolResult.data);
      }
    } finally {
      setRefreshing(false);
    }
  }, [restaurantId]);

  const assignmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const count = (id: string | null) => {
      if (id) counts[id] = (counts[id] || 0) + 1;
    };
    count(assignments.logoId);
    count(assignments.menuImageId);
    Object.values(assignments.meals).forEach(count);
    return counts;
  }, [assignments]);

  const selectedImage = imagePool.find((img) => img.imageId === selectedImageId);

  const handleSelectImage = (imageId: string) => {
    setSelectedImageId((prev) => (prev === imageId ? null : imageId));
  };

  const assignSelected = (slot: "logo" | "menuImage" | string) => {
    if (!selectedImageId) return;
    setAssignments((prev) => {
      if (slot === "logo") return { ...prev, logoId: selectedImageId };
      if (slot === "menuImage") return { ...prev, menuImageId: selectedImageId };
      return { ...prev, meals: { ...prev.meals, [slot]: selectedImageId } };
    });
  };

  const clearSlot = (slot: "logo" | "menuImage" | string) => {
    setAssignments((prev) => {
      if (slot === "logo") return { ...prev, logoId: null };
      if (slot === "menuImage") return { ...prev, menuImageId: null };
      return { ...prev, meals: { ...prev.meals, [slot]: null } };
    });
  };

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      const result = await bulkUpdateRestaurantImages({
        restaurantId,
        logoId: assignments.logoId,
        menuImageId: assignments.menuImageId,
        assignments: Object.entries(assignments.meals).map(([mealId, imgId]) => ({
          restaurantMenuId: mealId,
          imageId: imgId,
        })),
      });
      if (result.success) {
        setStatusType("success");
        setStatusTitle("Saved!");
        setStatusDescription("All image assignments have been committed.");
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setStatusType("error");
      setStatusTitle("Save Failed");
      setStatusDescription(err.message || "Failed to update images.");
    } finally {
      setSaving(false);
      setStatusOpen(true);
    }
  };

  const handleDeleteFromLibrary = async (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this image from the library? It will be unassigned everywhere.")) return;
    try {
      const result = await deleteLibraryImage(restaurantId, imageId);
      if (result.success) {
        setImagePool((prev) => prev.filter((img) => img.imageId !== imageId));
        setAssignments((prev) => {
          const newMeals = { ...prev.meals };
          Object.keys(newMeals).forEach((k) => {
            if (newMeals[k] === imageId) newMeals[k] = null;
          });
          return {
            logoId: prev.logoId === imageId ? null : prev.logoId,
            menuImageId: prev.menuImageId === imageId ? null : prev.menuImageId,
            meals: newMeals,
          };
        });
        if (selectedImageId === imageId) setSelectedImageId(null);
      } else {
        alert("Failed to remove image: " + result.error);
      }
    } catch {
      alert("Failed to remove image");
    }
  };

  const filteredMeals = useMemo(
    () =>
      menuItems.filter((item) => {
        const q = mealSearch.toLowerCase();
        return (
          !q ||
          (item.name || "").toLowerCase().includes(q) ||
          (item.menuItem?.name || "").toLowerCase().includes(q)
        );
      }),
    [menuItems, mealSearch]
  );

  const foodMeals = filteredMeals.filter((m) => (m.foodCategoryType as any) !== "DRINK");
  const drinkMeals = filteredMeals.filter((m) => (m.foodCategoryType as any) === "DRINK");

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex-none flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/restaurant-management/${restaurantId}/edit`)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-black text-sm leading-none text-gray-900 uppercase tracking-tight">
              {restaurant.name}
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5 italic">Image Library</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTelegramOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-blue-200 font-bold"
            title="Search Telegram for more images"
          >
            <Send className="w-3.5 h-3.5" />
            Find on Telegram
          </button>
          <button
            onClick={loadData}
            disabled={refreshing || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors border border-gray-200 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleBulkSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest bg-gray-900 hover:bg-black text-white transition-colors shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save All
          </button>
        </div>
      </header>

      {/* ── Selected image sticky banner ─────────────────────────── */}
      {selectedImage && (
        <div className="flex-none flex items-center gap-3 px-5 py-2 bg-blue-50 border-b border-blue-100 z-10">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-none ring-2 ring-blue-400 shadow-sm">
            <Image
              src={selectedImage.imageUrl}
              alt="selected"
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-700 truncate">
              Selected — click any slot on the right to assign
            </p>
            <p className="text-[10px] text-blue-500 truncate">
              {selectedImage.sourceMealName}
              {assignmentCounts[selectedImage.imageId]
                ? ` · used in ${assignmentCounts[selectedImage.imageId]} slot(s)`
                : ""}
            </p>
          </div>
          <button
            onClick={() => setSelectedImageId(null)}
            className="p-1 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-colors flex-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Two-panel layout ─────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">

        {/* LEFT — Image Pool */}
        <div className="w-[42%] flex flex-col border-r border-gray-200 bg-gray-900 relative">
          <div className="flex-none flex items-center justify-between px-4 pt-3 pb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <LayoutGrid className="w-3 h-3" />
              Library ({imagePool.length})
            </span>
            <span className="text-[9px] text-gray-600 italic flex items-center gap-1">
              <Eye className="w-3 h-3" /> to preview
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {imagePool.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm">No images yet.</p>
                <button
                  onClick={() => setTelegramOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Find on Telegram
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {imagePool.map((image) => {
                  const isSelected = selectedImageId === image.imageId;
                  const usageCount = assignmentCounts[image.imageId] || 0;
                  return (
                    <div
                      key={image.imageId}
                      onClick={() => handleSelectImage(image.imageId)}
                      className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900 shadow-xl scale-[1.03]"
                          : "ring-1 ring-gray-700 hover:ring-gray-500 hover:scale-[1.01]"
                      }`}
                    >
                      <BrokenImageFallback src={image.imageUrl} alt={image.sourceMealName} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button
                        onClick={(e) => handleDeleteFromLibrary(image.imageId, e)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-md z-10"
                        title="Remove from library"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        {usageCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-emerald-500/90 rounded-md text-[9px] font-bold text-white shadow-md">
                            {usageCount}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewImageId(image.imageId); }}
                        className="absolute bottom-1.5 left-1.5 p-1 bg-black/70 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black shadow-md z-10"
                        title="Preview image"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="bg-blue-500 rounded-full p-1 shadow-xl">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 pt-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                        <p className="text-[9px] text-white font-medium truncate leading-none pl-6">
                          {image.sourceMealName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lightbox */}
          {previewImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
              onClick={() => setPreviewImageId(null)}
            >
              <div
                className="relative max-w-xl w-full max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl bg-gray-900"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src={previewImage.imageUrl}
                    alt={previewImage.sourceMealName}
                    fill
                    className="object-contain"
                    sizes="80vw"
                    priority
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-t border-gray-800">
                  <div>
                    <p className="text-white text-xs font-semibold truncate">{previewImage.sourceMealName}</p>
                    {assignmentCounts[previewImage.imageId] > 0 && (
                      <p className="text-emerald-400 text-[10px] mt-0.5">
                        Used in {assignmentCounts[previewImage.imageId]} slot(s)
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setPreviewImageId(null)}
                    className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Assignment Slots */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            <section>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Star className="w-3 h-3" />
                Restaurant Assets
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <AssignmentSlot
                  label="Logo"
                  assignedImageId={assignments.logoId}
                  imagePool={imagePool}
                  isActive={!!selectedImageId}
                  onClick={() => assignSelected("logo")}
                  onClear={() => clearSlot("logo")}
                />
                <AssignmentSlot
                  label="Menu Banner"
                  assignedImageId={assignments.menuImageId}
                  imagePool={imagePool}
                  isActive={!!selectedImageId}
                  onClick={() => assignSelected("menuImage")}
                  onClear={() => clearSlot("menuImage")}
                />
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {menuItems.length > 0 ? (
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Utensils className="w-3 h-3" />
                  Meals ({menuItems.length})
                </h3>
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search meals..."
                    value={mealSearch}
                    onChange={(e) => setMealSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
                {foodMeals.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Utensils className="w-2.5 h-2.5" />
                      Food ({foodMeals.length})
                    </p>
                    <div className="space-y-0.5">
                      {foodMeals.map((item) => (
                        <MealSlotRow
                          key={item.id}
                          item={item}
                          assignedImageId={assignments.meals[item.id] ?? null}
                          imagePool={imagePool}
                          isActive={!!selectedImageId}
                          onClick={() => assignSelected(item.id)}
                          onClear={() => clearSlot(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {drinkMeals.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Coffee className="w-2.5 h-2.5" />
                      Drinks ({drinkMeals.length})
                    </p>
                    <div className="space-y-0.5">
                      {drinkMeals.map((item) => (
                        <MealSlotRow
                          key={item.id}
                          item={item}
                          assignedImageId={assignments.meals[item.id] ?? null}
                          imagePool={imagePool}
                          isActive={!!selectedImageId}
                          onClick={() => assignSelected(item.id)}
                          onClear={() => clearSlot(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {filteredMeals.length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-6">
                    No meals match &quot;{mealSearch}&quot;
                  </p>
                )}
              </section>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Utensils className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No menu items yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <StatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        type={statusType}
        title={statusTitle}
        description={statusDescription}
      />

      <TelegramSearchModal
        open={telegramOpen}
        onClose={() => setTelegramOpen(false)}
        restaurantId={restaurantId}
        restaurantName={restaurant?.name || ""}
        mealNames={menuItems.map((m) => m.name || m.menuItem?.name || "").filter(Boolean)}
        onImagesAdded={(count) => { if (count > 0) loadData(); }}
      />
    </div>
  );
}

// ── Broken-image-safe wrapper ─────────────────────────────────────────────────

function BrokenImageFallback({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 gap-1">
        <ImageIcon className="w-5 h-5 text-red-400" />
        <span className="text-[9px] text-red-400 font-medium">Broken</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
      onError={() => setBroken(true)}
    />
  );
}

// ── Assignment Slot ───────────────────────────────────────────────────────────

function AssignmentSlot({
  label, assignedImageId, imagePool, isActive, onClick, onClear,
}: {
  label: string;
  assignedImageId: string | null;
  imagePool: RestaurantImageOption[];
  isActive: boolean;
  onClick: () => void;
  onClear: () => void;
}) {
  const assignedImage = imagePool.find((img) => img.imageId === assignedImageId);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{label}</span>
        {assignedImageId && (
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-wider">
            Clear
          </button>
        )}
      </div>
      <div
        onClick={onClick}
        className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
          assignedImageId ? "border-blue-400 shadow-sm ring-1 ring-blue-100"
          : isActive ? "border-dashed border-blue-300 bg-blue-50 hover:border-blue-400"
          : "border-dashed border-gray-200 bg-gray-50 hover:border-gray-300"
        }`}
      >
        {assignedImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assignedImage.imageUrl} alt={label} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="absolute inset-0 bg-black/0 hover:bg-blue-500/10 transition-colors flex items-center justify-center">
              {isActive && <span className="opacity-0 hover:opacity-100 text-[10px] font-black text-white bg-blue-600/80 px-2 py-0.5 rounded-full uppercase">Replace</span>}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-1.5">
            <ImageIcon className="w-6 h-6 text-gray-300" />
            <p className="text-[10px] text-gray-400 font-medium">{isActive ? "Click to assign" : "No image"}</p>
          </div>
        )}
        {isActive && !assignedImageId && (
          <div className="absolute inset-0 animate-pulse bg-blue-400/5 pointer-events-none rounded-xl" />
        )}
      </div>
    </div>
  );
}

// ── Meal Row ──────────────────────────────────────────────────────────────────

function MealSlotRow({
  item, assignedImageId, imagePool, isActive, onClick, onClear,
}: {
  item: RestaurantMenu;
  assignedImageId: string | null;
  imagePool: RestaurantImageOption[];
  isActive: boolean;
  onClick: () => void;
  onClear: () => void;
}) {
  const assignedImage = imagePool.find((img) => img.imageId === assignedImageId);
  const displayName = item.name || item.menuItem?.name || "Unnamed";
  return (
    <div
      className={`group flex items-center gap-3 px-2 py-2 rounded-xl transition-all ${isActive ? "cursor-pointer hover:bg-blue-50" : "hover:bg-gray-50"}`}
      onClick={onClick}
    >
      <div className={`relative flex-none w-11 h-11 rounded-lg overflow-hidden border-2 transition-all ${
        assignedImageId ? "border-emerald-400 shadow-sm"
        : isActive ? "border-dashed border-blue-300 bg-blue-50"
        : "border-dashed border-gray-200 bg-gray-50"
      }`}>
        {assignedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={assignedImage.imageUrl} alt={displayName} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-gray-300" />
          </div>
        )}
        {isActive && !assignedImageId && (
          <div className="absolute inset-0 animate-pulse bg-blue-400/10 pointer-events-none" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate leading-none">{displayName}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
          {item.menuItem?.name && item.name ? item.menuItem.name : ""}
          {item.price ? ` · ${item.price} ETB` : ""}
        </p>
      </div>
      {assignedImageId && (
        <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="flex-none p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all" title="Clear assignment">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
