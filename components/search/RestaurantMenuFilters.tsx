"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  UtensilsCrossed,
  Flame,
  Leaf,
  Beef,
} from "lucide-react";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  Badge,
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

export function RestaurantMenuFilters() {
  const [dietary, setDietary] = useState<"all" | "fasting" | "meat">("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [search, setSearch] = useState("");

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <Input
          placeholder="Search this menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-14 bg-gray-50 border-gray-100 rounded-2xl focus:ring-blue-600 transition-all text-sm font-medium"
        />
      </div>

      {/* Triple State Fasting Switch */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dietary Preferences</span>
          <Badge className={cn(
             "text-[8px] font-black uppercase",
             dietary === 'fasting' ? "bg-emerald-500" : dietary === 'meat' ? "bg-red-500" : "bg-gray-400"
          )}>
             {dietary}
          </Badge>
        </div>
        <div className="relative h-12 bg-gray-100 rounded-2xl p-1 flex items-center">
          {/* Gliding Background */}
          <div 
            className={cn(
              "absolute top-1 bottom-1 w-[32%] rounded-xl transition-all duration-300 ease-out shadow-sm",
              dietary === "all" ? "left-1 bg-white" : 
              dietary === "fasting" ? "left-[34%] bg-emerald-500" : 
              "left-[67%] bg-red-500"
            )}
          />
          
          <button 
            onClick={() => setDietary("all")}
            className={cn(
              "relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
              dietary === "all" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Filter className="w-3.5 h-3.5" /> All
          </button>
          
          <button 
            onClick={() => setDietary("fasting")}
            className={cn(
              "relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
              dietary === "fasting" ? "text-white" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Leaf className="w-3.5 h-3.5" /> Fasting
          </button>
          
          <button 
            onClick={() => setDietary("meat")}
            className={cn(
              "relative z-10 flex-1 h-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
              dietary === "meat" ? "text-white" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Beef className="w-3.5 h-3.5" /> Meat
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Meal Types</Label>
        <div className="grid grid-cols-2 gap-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={cn(
                "h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all text-left flex items-center justify-between group",
                selectedTypes.includes(type)
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
              )}
            >
              {type}
              <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  selectedTypes.includes(type) ? "bg-white" : "bg-gray-200 group-hover:bg-gray-300"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* Sort Section */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sort Menu</Label>
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
                  : "bg-gray-50 text-gray-400 border-transparent hover:border-gray-200"
              )}
            >
              {opt.label}
              <ArrowUpDown className={cn("w-3.5 h-3.5", sortBy === opt.id ? "opacity-100" : "opacity-0")} />
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-200 mt-4">
        Discover Meals
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Version - Blended into Sidebar */}
      <div className={cn(
          "hidden md:block w-full",
          "p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] h-fit"
      )}>
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

      {/* Mobile Version - Floating FAB & Drawer */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full px-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full h-14 rounded-2xl bg-gray-900 text-white shadow-2xl shadow-gray-400 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
              <Filter className="w-4 h-4" />
              Filter Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] h-[90vh] overflow-y-auto p-8 rounded-t-[3rem] border-0 shadow-2xl transition-all duration-500 animate-in slide-in-from-bottom-full">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                Refine Menu
              </DialogTitle>
            </DialogHeader>
            <FilterContent />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("block", className)}>{children}</div>;
}
