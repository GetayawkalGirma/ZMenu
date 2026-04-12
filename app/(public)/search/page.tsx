"use client";

import { MenuItemFilters } from "@/components/search/MenuItemFilters";
import { MealCard } from "@/components/meal/MealCard";
import { PortionSize } from "@/lib/types/meal";
import { Search, Sparkles } from "lucide-react";

// Mock data for UI demonstration
const MOCK_MEALS = [
  {
    id: "1",
    name: "Classic Cheese Burger",
    description: "Juicy beef patty with melted cheddar, fresh lettuce, and our signature sauce.",
    price: 450,
    categoryId: "Fast Food",
    tags: ["popular", "classic", "beef"],
    portionSize: PortionSize.ONE_PERSON,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    calories: 650
  },
  {
    id: "2",
    name: "Special Shiro Tagino",
    description: "Authentic Ethiopian chickpea stew served with fresh Injera and side salad.",
    price: 180,
    categoryId: "Ethiopian",
    tags: ["traditional", "yetsom", "spicy"],
    portionSize: PortionSize.TWO_PEOPLE,
    imageUrl: "https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?q=80&w=800&auto=format&fit=crop",
    calories: 420
  },
  {
    id: "3",
    name: "Pepperoni Pizza",
    description: "Large hand-tossed pizza with premium pepperoni and spicy Italian herbs.",
    price: 850,
    categoryId: "Italian",
    tags: ["cheesy", "family", "sharing"],
    portionSize: PortionSize.FAMILY,
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop",
    calories: 1200
  },
  {
    id: "4",
    name: "Avocado Smoothie",
    description: "Creamy fresh avocado mixed with lime and a hint of honey.",
    price: 120,
    categoryId: "Drinks",
    tags: ["healthy", "fresh", "vegetarian"],
    portionSize: PortionSize.ONE_PERSON,
    imageUrl: "https://images.unsplash.com/photo-1543644672-7e1f41925346?q=80&w=800&auto=format&fit=crop",
    calories: 310
  }
];

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Search Hero Section */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden border-b border-gray-100">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Discover Great Tastes</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-8">
              Crave it. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 uppercase">Find it.</span>
            </h1>
            <p className="text-lg text-gray-400 font-medium max-w-xl leading-relaxed">
              Explore thousands of dishes across Addis Ababa. Filter by diet, spice level, or budget to find your perfect plate.
            </p>
          </div>
        </div>
      </section>

      {/* Main Search Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-32">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <MenuItemFilters />

          {/* Results Area */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-sm">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Found <span className="text-gray-900">{MOCK_MEALS.length}</span> Results
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                Sorted by <span className="text-indigo-600">Relevance</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {MOCK_MEALS.map((meal: any) => (
                <MealCard key={meal.id} meal={meal} showActions={false} />
              ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="pt-8 flex justify-center">
               <div className="flex gap-2">
                 {[1, 2, 3].map(page => (
                   <button 
                     key={page}
                     className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${
                       page === 1 ? "bg-gray-900 text-white shadow-xl" : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100"
                     }`}
                   >
                     {page}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
