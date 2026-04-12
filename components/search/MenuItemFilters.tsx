"use client";

import { useState } from "react";
import {
  Search,
  Flame,
  Leaf,
  MilkOff,
  Users,
  Coins,
  Filter,
  Utensils,
  GlassWater,
  PlusCircle,
  Tag,
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
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const PORTIONS = [
  { id: "ONE_PERSON", label: "Single" },
  { id: "TWO_PEOPLE", label: "Couple" },
  { id: "THREE_PEOPLE", label: "Group" },
  { id: "FAMILY", label: "Family" },
];

const FOOD_TYPES = [
  { id: "FOOD", label: "Meals", icon: Utensils },
  { id: "DRINK", label: "Drinks", icon: GlassWater },
  { id: "EXTRA", label: "Sides / Extras", icon: PlusCircle },
];

type FastingMode = "ALL" | "FASTING" | "NON_FASTING";

export function MenuItemFilters() {
  const [fastingMode, setFastingMode] = useState<FastingMode>("ALL");
  const [spicyLevel, setSpicyLevel] = useState<number | null>(null);
  const [selectedPortions, setSelectedPortions] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const togglePortion = (id: string) => {
    setSelectedPortions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Search Meals
        </Label>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
          <Input
            placeholder="e.g. Burger, Shiro, Pizza..."
            className="pl-10 h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Triple State Fasting Switch */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dietary Preference</Label>
        <div className="relative p-1.5 bg-gray-100 rounded-[2rem] flex items-center h-16 overflow-hidden border border-gray-200/50">
          {/* Gliding Indicator */}
          <div 
            className={cn(
              "absolute top-1.5 bottom-1.5 w-[calc(33.33%-4px)] rounded-[1.6rem] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-xl shadow-gray-200",
              fastingMode === "ALL" && "left-1.5 bg-white",
              fastingMode === "FASTING" && "left-[33.33%] bg-emerald-600 shadow-emerald-200",
              fastingMode === "NON_FASTING" && "left-[65.5%] bg-red-600 shadow-red-200"
            )}
          />
          
          <button 
            onClick={() => setFastingMode("ALL")}
            className={cn(
              "relative z-10 flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-500",
              fastingMode === "ALL" ? "text-gray-900" : "text-gray-400"
            )}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="text-[8px] font-black uppercase tracking-widest">All</span>
          </button>
          
          <button 
            onClick={() => setFastingMode("FASTING")}
            className={cn(
              "relative z-10 flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-500",
              fastingMode === "FASTING" ? "text-white" : "text-gray-400"
            )}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span className="text-[8px] font-black uppercase tracking-widest">Fasting</span>
          </button>
          
          <button 
            onClick={() => setFastingMode("NON_FASTING")}
            className={cn(
              "relative z-10 flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-500",
              fastingMode === "NON_FASTING" ? "text-white" : "text-gray-400"
            )}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[8px] font-black uppercase tracking-widest">Meat</span>
          </button>
        </div>
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
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl rotate-2"
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

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Budget (ETB)
          </Label>
          <Coins className="w-3 h-3 text-gray-300" />
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
              className="pl-10 h-10 rounded-xl border-gray-100 bg-gray-50 text-xs font-bold"
            />
          </div>
          <div className="w-2 h-px bg-gray-200 shrink-0" />
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
              className="pl-10 h-10 rounded-xl border-gray-100 bg-gray-50 text-xs font-bold"
            />
          </div>
        </div>
      </div>

      {/* Portion Sizes */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
          <Users className="w-3 h-3" /> Party Size
        </Label>
        <div className="flex flex-wrap gap-2">
          {PORTIONS.map((portion) => (
            <button
              key={portion.id}
              onClick={() => togglePortion(portion.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                selectedPortions.includes(portion.id)
                  ? "bg-gray-900 text-white border-gray-900 shadow-lg -translate-y-0.5"
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-300",
              )}
            >
              {portion.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spicy Level Selector */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 group">
          Spiciness <span className="text-gray-300 ml-1"> (0-5 Level)</span>
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
      <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 mt-4 group">
        Initialize Search
        <Tag className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
      </Button>
    </div>
  );

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
            Meal Explorer
          </h2>
          {fastingMode !== "ALL" && (
            <Badge className={cn(
              "animate-pulse",
              fastingMode === "FASTING" ? "bg-emerald-500" : "bg-red-500"
            )}>
              {fastingMode === "FASTING" ? "Fast Mode" : "Non-Fast"}
            </Badge>
          )}
        </div>
        <FilterContent />
      </aside>

      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full px-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full h-14 rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-200 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
              <Filter className="w-4 h-4" />
              Tune Your Plate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] h-[90vh] overflow-y-auto p-8 rounded-t-[3rem] border-0 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                Customize Search
              </DialogTitle>
            </DialogHeader>
            <FilterContent />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
