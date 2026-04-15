"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  Wifi,
  ParkingCircle,
  Users,
  TreePine,
  Filter,
  X,
  CreditCard,
  Phone,
  ArrowUpDown,
} from "lucide-react";
import {
  Button,
  Input,
  Checkbox,
  Label,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogClose,
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";

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

const FEATURES = [
  { id: "wifi", label: "Free Wi-Fi", icon: Wifi },
  { id: "parking", label: "Parking", icon: ParkingCircle },
  { id: "outdoor", label: "Outdoor", icon: TreePine },
  { id: "family", label: "Family", icon: Users },
  { id: "delivery", label: "Delivery", icon: CreditCard },
  { id: "cards", label: "Accepts Cards", icon: CreditCard },
];

export function RestaurantFilters({ trigger }: { trigger?: React.ReactNode }) {
  const [isNearMe, setIsNearMe] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Near Me Toggle */}
      <div
        className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 flex items-center justify-between group cursor-pointer hover:bg-blue-50 transition-colors"
        onClick={() => setIsNearMe(!isNearMe)}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
              isNearMe
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-blue-600 shadow-sm",
            )}
          >
            <MapPin className={cn("w-5 h-5", isNearMe && "animate-pulse")} />
          </div>
          <div>
            <div className="text-sm font-black text-gray-900 leading-none mb-1">
              Near Me
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              Based on your GPS
            </div>
          </div>
        </div>
        <div
          className={cn(
            "w-10 h-5 rounded-full relative transition-colors duration-300",
            isNearMe ? "bg-blue-600" : "bg-gray-200",
          )}
        >
          <div
            className={cn(
              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
              isNearMe ? "right-1" : "left-1",
            )}
          />
        </div>
      </div>

      {/* Sorting Section */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Sort By
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "recommended", label: "Top Rated" },
            { id: "price_asc", label: "Price: Lo-Hi" },
            { id: "price_desc", label: "Price: Hi-Lo" },
            { id: "popular", label: "Popular" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={cn(
                "h-10 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                sortBy === opt.id
                  ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-300",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Kinds Checklist */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
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

      {/* Atmosphere & Features Checklist */}
      <div className="space-y-4 pt-4 border-t border-gray-50">
        <div className="flex justify-between items-center px-1">
          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Atmosphere & Features
          </Label>
          {selectedFeatures.length > 0 && (
            <button
              onClick={() => setSelectedFeatures([])}
              className="text-[9px] font-black text-indigo-600 uppercase hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            const active = selectedFeatures.includes(feat.id);
            return (
              <label
                key={feat.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                  active
                    ? "bg-indigo-50/50 border-indigo-200"
                    : "bg-white border-gray-100 hover:border-gray-200",
                )}
              >
                <Checkbox
                  checked={active}
                  onCheckedChange={() => toggleFeature(feat.id)}
                  className="rounded-md border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5",
                      active ? "text-indigo-600" : "text-gray-400",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-bold transition-colors",
                      active
                        ? "text-indigo-700"
                        : "text-gray-600 group-hover:text-gray-900",
                    )}
                  >
                    {feat.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block w-80 shrink-0",
          "p-8 bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-100/50 h-fit sticky top-24",
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
            Refine Results
          </h2>
          <Badge
            variant="outline"
            className="rounded-lg h-6 px-2 text-[10px] font-black border-gray-100"
          >
            {selectedCategories.length + selectedFeatures.length} Active
          </Badge>
        </div>
        <FilterContent />
      </aside>

      {/* Mobile Floating Trigger - Relocated for Nav Compatibility */}
      <div className="md:hidden">
        <Dialog>
          {trigger ? (
            <DialogTrigger asChild>{trigger}</DialogTrigger>
          ) : (
            <DialogTrigger asChild>
              <Button className="w-full h-12 rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[425px] h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-t-[2.5rem] border-0 shadow-2xl transition-all duration-500 animate-in slide-in-from-bottom-full">
            <DialogHeader className="mb-6 sm:mb-8 text-left">
              <DialogTitle className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">
                Filters
              </DialogTitle>
            </DialogHeader>
            <FilterContent />
            <DialogClose asChild>
              <Button className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black font-black uppercase tracking-[0.2em] text-xs shadow-xl mt-4">
                Apply Filters
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
