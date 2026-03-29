"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { Search, Info, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function SearchContent({ 
  initialData, 
  initialQuery 
}: { 
  initialData: any[], 
  initialQuery: string 
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <div className="space-y-24">
      {/* Search Bar Interactive */}
      <div className="max-w-3xl">
        <form onSubmit={handleSearch} className="relative group">
           <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 scale-x-0 group-focus-within:scale-x-100 origin-left" />
           <div className="flex items-center bg-white py-6 sm:py-8 border-b border-gray-100 group-focus-within:border-transparent transition-all">
              <Search className="w-8 h-8 text-gray-200 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for Pizzas, Burgers, or anything..."
                className="flex-1 bg-transparent px-6 sm:px-10 text-3xl sm:text-4xl font-black text-gray-900 placeholder:text-gray-100 focus:outline-none tracking-tighter"
              />
              <button 
                type="submit"
                className="w-16 h-16 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-100 group-hover:shadow-blue-100"
              >
                 <ChevronRight className="w-6 h-6" />
              </button>
           </div>
        </form>
      </div>

      {/* Results Grid */}
      <div className="space-y-12">
        <div className="flex items-center justify-between border-b border-gray-100 pb-8">
           <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Market Results
           </h2>
           <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
              {initialData.length} Items Found
           </span>
        </div>

        {initialData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {initialData.map((item) => (
              <Link key={item.id} href={`/meals/${item.id}`} className="group block space-y-8">
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-gray-50 border-8 border-white shadow-2xl shadow-gray-200 group-hover:shadow-blue-200 group-hover:border-blue-50 transition-all duration-700">
                    <img 
                      src={item.imageUrl || "https://placehold.co/600x800?text=Premium+Meal"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.3] group-hover:grayscale-0"
                      alt={item.name}
                    />
                    <div className="absolute top-8 right-8 px-6 py-2.5 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 font-black text-blue-600 text-sm tracking-tighter">
                       Avg: {item.avgPrice ? formatPrice(item.avgPrice) : "—"}
                    </div>
                </div>

                <div className="px-2 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 block">
                       {item.category?.name || "Global Dish"}
                    </span>
                    <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed h-10">
                    {item.description || "A masterfully crafted culinary concept shared across multiple venues."}
                  </p>
                  
                  <div className="pt-4 flex items-center gap-6">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Pricing</span>
                        <span className="text-xs font-black text-green-600">{item.priceCount || 0} Venues</span>
                     </div>
                     <div className="w-px h-6 bg-gray-100" />
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Status</span>
                        <span className="text-xs font-black text-gray-900 italic">Market Prime</span>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Info className="w-10 h-10 text-gray-200" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">No culinary matches</h3>
             <p className="mt-4 text-gray-400 font-medium">Try broadening your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
