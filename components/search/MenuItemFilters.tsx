"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  Utensils,
  GlassWater,
  PlusCircle,
  Tag,
  MapPin,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogClose,
  Checkbox,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const FOOD_TYPES = [
  { id: "MEAL", label: "Meals", icon: Utensils },
  { id: "DRINK", label: "Drinks", icon: GlassWater },
  { id: "SIDES", label: "Sides", icon: PlusCircle },
];

const CATEGORIES = [
  "Ethiopian",
  "Fast Food",
  "Italian",
  "Seafood",
  "Indian",
  "Breakfast",
  "Desserts",
  "Drinks",
];

export function MenuItemFilters({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [nearMe, setNearMe] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const isInitialRender = useRef(true);
  const isSyncing = useRef(false);

  useEffect(() => {
    setMounted(true);
    isSyncing.current = true;
    setSearch(searchParams?.get("search") || "");
    setSelectedTypes(
      searchParams?.get("types")?.split(",").filter(Boolean) || [],
    );
    setSelectedCategories(
      searchParams?.get("categories")?.split(",").filter(Boolean) || [],
    );
    setNearMe(searchParams?.get("nearMe") === "true");
    const lat = searchParams?.get("lat");
    const lng = searchParams?.get("lng");
    if (lat && lng) {
      setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
    } else {
      setCoords(null);
    }
    // Allow state updates to settle before enabling sync back to URL
    setTimeout(() => {
      isSyncing.current = false;
    }, 0);
  }, [searchParams]);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      // Guard against null searchParams
      const newParams = new URLSearchParams(searchParams?.toString() || "");
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      return newParams.toString();
    },
    [searchParams],
  );

  useEffect(() => {
    if (!mounted || isInitialRender.current || isSyncing.current) {
      if (mounted) isInitialRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const query = createQueryString({
        search: search || null,
        types: selectedTypes.length > 0 ? selectedTypes.join(",") : null,
        categories:
          selectedCategories.length > 0 ? selectedCategories.join(",") : null,
        nearMe: nearMe ? "true" : null,
        lat: nearMe && coords ? coords.lat.toString() : null,
        lng: nearMe && coords ? coords.lng.toString() : null,
        page: "1",
      });
      router.push(`${pathname}?${query}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    search,
    selectedTypes,
    selectedCategories,
    nearMe,
    coords,
    pathname,
    router,
    createQueryString,
    mounted,
  ]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleNearMeToggle = (checked: boolean) => {
    if (checked) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setNearMe(true);
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert(
              "Could not get your location. Please enable location services.",
            );
            setNearMe(false);
          },
        );
      } else {
        alert("Geolocation is not supported by your browser.");
        setNearMe(false);
      }
    } else {
      setNearMe(false);
      setCoords(null);
    }
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Near Me Toggle */}
      <div className="space-y-4">
        <label
          className={cn(
            "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
            nearMe
              ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
              : "bg-white border-gray-100 hover:border-gray-200",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                nearMe ? "bg-white/20" : "bg-indigo-50",
              )}
            >
              <MapPin
                className={cn(
                  "w-4 h-4",
                  nearMe ? "text-white" : "text-indigo-600",
                )}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                Near Me
              </span>
              <span
                className={cn(
                  "text-[8px] font-bold uppercase tracking-tight mt-1",
                  nearMe ? "text-indigo-100" : "text-gray-400",
                )}
              >
                Show closest results
              </span>
            </div>
          </div>
          <Checkbox
            checked={nearMe}
            onCheckedChange={handleNearMeToggle}
            className={cn(
              "border-2",
              nearMe
                ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
                : "border-gray-200",
            )}
          />
        </label>
      </div>

      {/* Meal Category / Type Grid */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Meal Type
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {FOOD_TYPES.map((type) => {
            const Icon = type.icon;
            const active = selectedTypes.includes(type.id);
            return (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className={cn(
                  "p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group",
                  active
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl"
                    : "bg-white border-gray-100 text-gray-400 hover:border-indigo-200",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    active ? "text-white" : "group-hover:text-indigo-500",
                  )}
                />
                <span className="text-[8px] font-black uppercase tracking-tighter text-center">
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal Kinds Checklist */}
      <div className="space-y-4 pt-4 border-t border-gray-50">
        <div className="flex justify-between items-center px-1">
          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Meal Kinds
          </Label>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-[9px] font-black text-blue-600 uppercase hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                selectedCategories.includes(cat)
                  ? "bg-indigo-50/50 border-indigo-200"
                  : "bg-white border-gray-100 hover:border-gray-200",
              )}
            >
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
                className="rounded-md border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
              <span
                className={cn(
                  "text-sm font-bold transition-colors",
                  selectedCategories.includes(cat)
                    ? "text-indigo-700"
                    : "text-gray-600 group-hover:text-gray-900",
                )}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="w-full p-8 bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] h-[400px] animate-pulse" />
    );
  }

  return (
    <>
      <aside
        className={cn(
          "hidden md:block w-80 shrink-0",
          "p-8 bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-indigo-100/30 h-fit sticky top-24",
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
            Refine Search
          </h2>
        </div>
        <FilterContent />
      </aside>

      {/* Mobile Trigger Support */}
      <div className="md:hidden">
        <Dialog>
          {trigger ? (
            <DialogTrigger asChild>{trigger}</DialogTrigger>
          ) : (
            <DialogTrigger asChild>
              <Button className="w-full h-12 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Results
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[425px] h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-t-[2.5rem] border-0 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <DialogHeader className="mb-6 sm:mb-8 text-left">
              <DialogTitle className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">
                Refine Search
              </DialogTitle>
            </DialogHeader>
            <FilterContent />
            <DialogClose asChild>
              <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 mt-4 group">
                Apply Filters
                <Tag className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
