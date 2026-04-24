"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  UtensilsCrossed,
  Flame,
  Leaf,
  Beef,
  Users,
  Coins,
  PlusCircle,
  Tag,
  MapPin,
  Compass,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Input,
  Badge,
  Label,
  Checkbox,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Desserts",
  "Drinks",
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

const PORTIONS = [
  { id: "ONE_PERSON", label: "Single" },
  { id: "TWO_PEOPLE", label: "Couple" },
  { id: "THREE_PEOPLE", label: "Group" },
  { id: "FAMILY", label: "Family" },
];

export function RestaurantMenuFilters({
  isGlobal = false,
  trigger,
}: {
  isGlobal?: boolean;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [dietary, setDietary] = useState<"all" | "fasting" | "meat">("all");
  const [nearMe, setNearMe] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [search, setSearch] = useState("");
  const [spicyLevel, setSpicyLevel] = useState<number | null>(null);
  const [selectedPortions, setSelectedPortions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const isInitialRender = useRef(true);
  const isSyncing = useRef(false);

  useEffect(() => {
    setMounted(true);
    isSyncing.current = true;
    setDietary((searchParams?.get("dietary") as any) || "all");
    setNearMe(searchParams?.get("nearMe") === "true");
    const lat = searchParams?.get("lat");
    const lng = searchParams?.get("lng");
    if (lat && lng) {
      setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
    } else {
      setCoords(null);
    }
    setSelectedTypes(searchParams?.get("types")?.split(",").filter(Boolean) || []);
    setSortBy(searchParams?.get("sortBy") || "recommended");
    setSearch(searchParams?.get("search") || "");
    setSpicyLevel(searchParams?.get("spicy") ? parseInt(searchParams.get("spicy")!) : null);
    setSelectedPortions(searchParams?.get("portions")?.split(",").filter(Boolean) || []);
    setSelectedCategories(searchParams?.get("categories")?.split(",").filter(Boolean) || []);
    setPriceRange({
      min: searchParams?.get("minPrice") || "",
      max: searchParams?.get("maxPrice") || "",
    });

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
    [searchParams]
  );

  useEffect(() => {
    if (!mounted || isInitialRender.current || isSyncing.current) {
      if (mounted) isInitialRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const query = createQueryString({
        search: search || null,
        dietary: dietary !== "all" ? dietary : null,
        types: selectedTypes.length > 0 ? selectedTypes.join(",") : null,
        categories: selectedCategories.length > 0 ? selectedCategories.join(",") : null,
        portions: selectedPortions.length > 0 ? selectedPortions.join(",") : null,
        sortBy: sortBy !== "recommended" ? sortBy : null,
        spicy: spicyLevel !== null ? spicyLevel.toString() : null,
        minPrice: priceRange.min || null,
        maxPrice: priceRange.max || null,
        nearMe: nearMe ? "true" : null,
        lat: nearMe && coords ? coords.lat.toString() : null,
        lng: nearMe && coords ? coords.lng.toString() : null,
        page: "1",
      });
      router.push(`${pathname}?${query}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, dietary, selectedTypes, selectedCategories, selectedPortions, sortBy, spicyLevel, priceRange, nearMe, coords, pathname, router, createQueryString, mounted]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const togglePortion = (id: string) => {
    setSelectedPortions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const [geoLoading, setGeoLoading] = useState(false);

  const handleNearMeToggle = (checked: boolean) => {
    if (checked) {
      if ("geolocation" in navigator) {
        setGeoLoading(true);
        setNearMe(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setGeoLoading(false);
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Could not get your location. Please enable location services.");
            setNearMe(false);
            setGeoLoading(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 300000,
          }
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
      {/* Search & Location Hub */}
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
              {geoLoading ? (
                <div className={cn(
                  "w-4 h-4 border-2 rounded-full animate-spin",
                  nearMe ? "border-white/30 border-t-white" : "border-indigo-200 border-t-indigo-600"
                )} />
              ) : (
                <MapPin
                  className={cn(
                    "w-4 h-4",
                    nearMe ? "text-white" : "text-indigo-600",
                  )}
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                {geoLoading ? "Locating..." : "Near Me"}
              </span>
              <span
                className={cn(
                  "text-[8px] font-bold uppercase tracking-tight mt-1",
                  nearMe ? "text-indigo-100" : "text-gray-400",
                )}
              >
                {geoLoading ? "Getting your GPS position" : "Show closest results"}
              </span>
            </div>
          </div>
          <Checkbox
            checked={nearMe}
            onCheckedChange={handleNearMeToggle}
            disabled={geoLoading}
            className={cn(
              "border-2",
              nearMe
                ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
                : "border-gray-200",
            )}
          />
        </label>
      </div>

      {/* Triple State Fasting Switch */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Dietary Preferences
          </span>
          <Badge
            className={cn(
              "text-[8px] font-black uppercase",
              dietary === "fasting"
                ? "bg-emerald-500"
                : dietary === "meat"
                  ? "bg-red-500"
                  : "bg-gray-400",
            )}
          >
            {dietary}
          </Badge>
        </div>
        <div className="relative h-12 bg-gray-100 rounded-2xl p-1 flex items-center">
          {/* Gliding Background */}
          <div
            className={cn(
              "absolute top-1 bottom-1 w-[32%] rounded-xl transition-all duration-300 ease-out shadow-sm",
              dietary === "all"
                ? "left-1 bg-white"
                : dietary === "fasting"
                  ? "left-[34%] bg-emerald-500"
                  : "left-[67%] bg-red-500",
            )}
          />

          <button
            onClick={() => setDietary("all")}
            className={cn(
              "relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
              dietary === "all"
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <Filter className="w-3.5 h-3.5" /> All
          </button>

          <button
            onClick={() => setDietary("fasting")}
            className={cn(
              "relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
              dietary === "fasting"
                ? "text-white"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <Leaf className="w-3.5 h-3.5" /> Fasting
          </button>

          <button
            onClick={() => setDietary("meat")}
            className={cn(
              "relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
              dietary === "meat"
                ? "text-white"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <Beef className="w-3.5 h-3.5" /> Meat
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Meal Types
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={cn(
                "h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all text-left flex items-center justify-between group",
                selectedTypes.includes(type)
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-300",
              )}
            >
              {type}
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  selectedTypes.includes(type)
                    ? "bg-white"
                    : "bg-gray-200 group-hover:bg-gray-300",
                )}
              />
            </button>
          ))}
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
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-white border-gray-100 hover:border-gray-200",
              )}
            >
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
                className="rounded-md border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <span
                className={cn(
                  "text-sm font-bold transition-colors",
                  selectedCategories.includes(cat)
                    ? "text-blue-700"
                    : "text-gray-600 group-hover:text-gray-900",
                )}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Budget (ETB)
          </Label>
          <Coins className="w-3.5 h-3.5 text-gray-300" />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">
              MIN
            </span>
            <Input
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="pl-12 h-12 rounded-xl border-gray-100 bg-gray-50 text-xs font-black"
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">
              MAX
            </span>
            <Input
              type="number"
              placeholder="5000"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="pl-12 h-12 rounded-xl border-gray-100 bg-gray-50 text-xs font-black"
            />
          </div>
        </div>
      </div>

      {/* Spiciness Level */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Heat Tolerance
        </Label>
        <div className="flex justify-between p-2 bg-orange-50/50 rounded-2xl border border-orange-100">
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setSpicyLevel(level === spicyLevel ? null : level)}
              className={cn(
                "w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all",
                spicyLevel === level
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200 -translate-y-1"
                  : "bg-white/80 text-orange-400 hover:bg-white hover:text-orange-600",
              )}
            >
              <Flame
                className={cn(
                  "w-4 h-4 mb-0.5",
                  spicyLevel !== null && level <= spicyLevel
                    ? "fill-current"
                    : "opacity-40",
                )}
              />
              <span className="text-[9px] font-black leading-none">
                {level}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Party Size */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Party Size
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {PORTIONS.map((portion) => (
            <button
              key={portion.id}
              onClick={() => togglePortion(portion.id)}
              className={cn(
                "h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center",
                selectedPortions.includes(portion.id)
                  ? "bg-gray-900 text-white border-gray-900 shadow-xl -translate-y-0.5"
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-300",
              )}
            >
              {portion.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Section */}
      <div className="space-y-3 pt-4 border-t border-gray-50">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Sort Menu
        </Label>
        <div className="space-y-2">
          {[
            { id: "recommended", label: "Recommended" },
            { id: "popular", label: "Most Popular" },
            { id: "price_asc", label: "Lowest Price" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={cn(
                "w-full h-12 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between border transition-all",
                sortBy === opt.id
                  ? "bg-gray-900 text-white border-gray-900 shadow-xl"
                  : "bg-gray-50 text-gray-400 border-transparent hover:border-gray-200",
              )}
            >
              {opt.label}
              <ArrowUpDown
                className={cn(
                   "w-3.5 h-3.5",
                   sortBy === opt.id ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="w-full p-8 bg-white rounded-[2.5rem] border border-gray-100 h-[600px] animate-pulse" />
    );
  }

  return (
    <>
      {/* Desktop Version - Blended into Sidebar */}
      <div
        className={cn(
          "hidden md:block w-full",
          "p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] h-fit",
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
              Menu Filters
            </h2>
          </div>
        </div>
        <FilterContent />
      </div>

      {/* Mobile Version - Explicit Trigger Support */}
      <div className="md:hidden">
        <Dialog>
          {trigger ? (
            <DialogTrigger asChild>{trigger}</DialogTrigger>
          ) : (
            <DialogTrigger asChild>
              <Button className="w-full h-12 rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[425px] h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-t-[2.5rem] border-0 shadow-2xl transition-all duration-500 animate-in slide-in-from-bottom-full">
            <DialogHeader className="mb-6 sm:mb-8 text-left">
              <DialogTitle className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">
                Refine Menu
              </DialogTitle>
            </DialogHeader>
            <FilterContent />
            <DialogClose asChild>
              <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-200 mt-4">
                Apply Filters
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
