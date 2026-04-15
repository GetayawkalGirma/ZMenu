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
    <div className="space-y-12 sm:space-y-24 px-2 sm:px-0">
      {/* Search Bar Interactive */}
      <div className="max-w-3xl">
        <form onSubmit={handleSearch} className="relative group">
           <div className="absolute inset-x-0 bottom-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 scale-x-0 group-focus-within:scale-x-100 origin-left" />
           <div className="flex items-center bg-white py-4 sm:py-8 border-b border-gray-100 group-focus-within:border-transparent transition-all">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-200 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent px-4 sm:px-10 text-xl sm:text-4xl font-black text-gray-900 placeholder:text-gray-100 focus:outline-none tracking-tighter"
              />
              <button 
                type="submit"
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-900 text-white rounded-xl sm:rounded-[2rem] flex items-center justify-center hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-100 group-hover:shadow-blue-100"
              >
                 <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
           </div>
        </form>
      </div>

      {/* Results Grid */}
      <div className="space-y-6 sm:space-y-12">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 sm:pb-8">
           <h2 className="text-xs sm:text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 sm:gap-4">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Results
           </h2>
           <span className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest sm:tracking-[0.3em]">
              {initialData.length} Found
           </span>
        </div>

        {initialData.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-8">
            {initialData.map((item) => (
              <Link key={item.id} href={`/meals/${item.id}`} className="group block space-y-2 sm:space-y-8 h-full">
                <div className="relative aspect-square sm:aspect-[4/5] rounded-xl sm:rounded-[3rem] overflow-hidden bg-gray-50 border-2 sm:border-8 border-white shadow-lg sm:shadow-2xl shadow-gray-200 group-hover:shadow-blue-200 group-hover:border-blue-50 transition-all duration-700">
                    <img 
                      src={item.imageUrl || "https://placehold.co/600x800?text=Premium+Meal"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.3] group-hover:grayscale-0"
                      alt={item.name}
                    />
                    <div className="absolute top-2 right-2 sm:top-8 sm:right-8 px-2 py-1 sm:px-6 sm:py-2.5 bg-white/90 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-xl border border-white/40 font-black text-blue-600 text-[8px] sm:text-sm tracking-tighter">
                       {item.avgPrice ? formatPrice(item.avgPrice) : "—"}
                    </div>
                </div>

                <div className="px-1 sm:px-2 space-y-1 sm:space-y-4">
                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-[7px] sm:text-[9px] font-black text-gray-400 uppercase tracking-tight sm:tracking-[0.4em] block truncate">
                       {item.category?.name || "Premium Dish"}
                    </span>
                    <h3 className="text-[10px] sm:text-3xl font-black text-gray-900 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                       {item.name}
                    </h3>
                  </div>
                  <p className="hidden sm:block text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed">
                    {item.description || "A masterfully crafted culinary concept."}
                  </p>
                  
                  <div className="pt-1 sm:pt-4 flex items-center gap-2 sm:gap-6">
                     <div className="flex flex-col">
                        <span className="text-[6px] sm:text-[8px] font-black text-gray-300 uppercase tracking-widest hidden xs:block">Pricing</span>
                        <span className="text-[8px] sm:text-xs font-black text-green-600 whitespace-nowrap">{item.priceCount || 0} Venues</span>
                     </div>
                     <div className="w-px h-4 sm:h-6 bg-gray-100 hidden xs:block" />
                     <div className="flex flex-col">
                        <span className="text-[6px] sm:text-[8px] font-black text-gray-300 uppercase tracking-widest hidden xs:block">Market</span>
                        <span className="text-[8px] sm:text-xs font-black text-gray-900 italic hidden xs:block">Prime</span>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 sm:py-40 text-center">
             <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-8">
                <Info className="w-6 h-6 sm:w-10 sm:h-10 text-gray-200" />
             </div>
             <h3 className="text-sm sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">No culinary matches</h3>
             <p className="mt-2 text-[10px] sm:text-sm text-gray-400 font-medium tracking-tight">Try broadening your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
