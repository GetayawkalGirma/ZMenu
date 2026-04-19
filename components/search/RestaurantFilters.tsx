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

const FEATURES = [
  { id: "cmnyu5p6f0003c2r9547h8q2p", label: "Luxury Dining" },
  { id: "cmnyu5p6f0004c2r9639j0r3q", label: "Grab & Go" },
  { id: "cmnyu5p6f0005c2r9741k1r4r", label: "Outdoor Seating" },
  { id: "cmnyu5p6f0006c2r9852l2r5s", label: "WiFi Available" },
  { id: "cmnyu5p6f0007c2r9963m3r6t", label: "Parking Space" },
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

export function RestaurantFilters({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [nearMe, setNearMe] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const isInitialRender = useRef(true);
  const isSyncing = useRef(false);

  useEffect(() => {
    setMounted(true);
    isSyncing.current = true;
    setSearch(searchParams?.get("search") || "");
    setSelectedFeatures(searchParams?.get("features")?.split(",").filter(Boolean) || []);
    setSelectedCategories(searchParams?.get("categories")?.split(",").filter(Boolean) || []);
    setSortBy(searchParams?.get("sortBy") || "recommended");
    setNearMe(searchParams?.get("nearMe") === "true");
    const lat = searchParams?.get("lat");
    const lng = searchParams?.get("lng");
    if (lat && lng) {
      setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
    } else {
      setCoords(null);
    }

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
        features: selectedFeatures.length > 0 ? selectedFeatures.join(",") : null,
        categories: selectedCategories.length > 0 ? selectedCategories.join(",") : null,
        sortBy: sortBy !== "recommended" ? sortBy : null,
        nearMe: nearMe ? "true" : null,
        lat: nearMe && coords ? coords.lat.toString() : null,
        lng: nearMe && coords ? coords.lng.toString() : null,
        page: "1",
      });
      router.push(`${pathname}?${query}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, selectedFeatures, selectedCategories, sortBy, nearMe, coords, pathname, router, createQueryString, mounted]);

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
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
            alert("Could not get your location. Please enable location services.");
            setNearMe(false);
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
      {/* Location Toggle */}
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

      {/* Sorting */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Sort By
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "recommended", label: "Recommended" },
            { id: "popular", label: "Popular" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={cn(
                "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                sortBy === opt.id
                  ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-200",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Vibe & Services
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              className={cn(
                "h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all text-left flex items-center justify-between group",
                selectedFeatures.includes(feature.id)
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-300",
              )}
            >
              {feature.label}
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  selectedFeatures.includes(feature.id)
                    ? "bg-white"
                    : "bg-gray-200 group-hover:bg-gray-300",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Categories Checklist */}
      <div className="space-y-4 pt-4 border-t border-gray-50">
        <div className="flex justify-between items-center px-1">
          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Cuisines
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
    </div>
  );

  if (!mounted) {
    return (
      <div className="w-full p-8 bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] h-[500px] animate-pulse" />
    );
  }

  return (
    <>
      <aside
        className={cn(
          "hidden md:block w-80 shrink-0",
          "p-8 bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-blue-100/30 h-fit sticky top-24",
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
            Refine
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
              <Button className="w-full h-12 rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[425px] h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-t-[2.5rem] border-0 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <DialogHeader className="mb-6 sm:mb-8 text-left">
              <DialogTitle className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">
                Filter Results
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
