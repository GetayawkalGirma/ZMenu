"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Utensils,
  GlassWater,
  PlusCircle,
  Tag,
  Leaf,
  Beef,
  Users,
  Coins,
  Flame,
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
  Checkbox,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const FOOD_TYPES = [
  { id: "FOOD", label: "Meals", icon: Utensils },
  { id: "DRINK", label: "Drinks", icon: GlassWater },
  { id: "EXTRA", label: "Sides / Extras", icon: PlusCircle },
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

export function MenuItemFilters() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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

      <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 mt-4 group">
        Explore Directory
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
            Directory Discovery
          </h2>
        </div>
        <FilterContent />
      </aside>

      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full px-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full h-14 rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-200 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
              <Filter className="w-4 h-4" />
              Tune Your Search
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] h-[90vh] overflow-y-auto p-8 rounded-t-[3rem] border-0 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                Refine Search
              </DialogTitle>
            </DialogHeader>
            <FilterContent />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
