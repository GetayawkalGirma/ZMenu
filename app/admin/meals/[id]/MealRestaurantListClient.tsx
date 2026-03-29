"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import {
  MapPin,
  Clock,
  Flame,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui";
import type { MenuItem, RestaurantMenu } from "@/lib/types/meal";
import { PortionSize } from "@/lib/types/meal";
import { formatPrice } from "@/lib/utils";

export default function MealRestaurantListClient({
  meal,
  initialRestaurants,
}: {
  meal: MenuItem;
  initialRestaurants: RestaurantMenu[];
}) {
  const [restaurants] = useState<RestaurantMenu[]>(initialRestaurants);

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "newest">(
    "price-asc",
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const getPortionSizeLabel = (portionSize: PortionSize | null | undefined) => {
    if (!portionSize) return "Not specified";
    const labels: Record<string, string> = {
      [PortionSize.ONE_PERSON]: "One Person",
      [PortionSize.TWO_PEOPLE]: "Two People",
      [PortionSize.THREE_PEOPLE]: "Three People",
      [PortionSize.FAMILY]: "Family",
    };
    return labels[portionSize] || portionSize;
  };

  // Filter and Sort Logic
  const filteredRestaurants = restaurants
    .filter((rm) => {
      const matchesSearch =
        (rm.restaurant?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (rm.name || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterType === "all" || rm.portionSize === filterType;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      return 0;
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchQuery, sortBy, filterType]);

  return (
    <div className="mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Market Availability
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-600 border-none px-3"
            >
              {filteredRestaurants.length} results
            </Badge>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Comparing restaurants serving this meal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search restaurants or variants..."
              className="pl-10 h-10 border-gray-200 bg-white rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none h-10 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none h-10 pl-9 pr-10 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="all">All Sizes</option>
              {Object.values(PortionSize).map((size) => (
                <option key={size} value={size}>
                  {getPortionSizeLabel(size)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {paginatedRestaurants.length === 0 ? (
          <Card className="border-gray-100 shadow-sm border-dashed">
            <CardContent className="py-20 text-center">
              <div className="text-gray-300 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto"
                >
                  <path d="m5 11 4-7" />
                  <path d="m19 11-4-7" />
                  <path d="M2 11h20" />
                  <path d="m3.5 11 1.6 7.4c.2.8.9 1.2 1.7 1.2h10.4c.8 0 1.5-.4 1.7-1.2l1.6-7.4" />
                  <path d="m9 11 1 9" />
                  <path d="m15 11-1 9" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                No restaurants currently serve this meal.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {paginatedRestaurants.map((rm) => (
              <Card
                key={rm.id}
                className="overflow-hidden border-0 shadow-sm shadow-gray-200 hover:shadow-xl transition-all duration-300 group bg-white"
              >
                <div className="flex flex-col sm:flex-row relative h-auto sm:h-56">
                  {/* Left Image Section with Fade */}
                  <div className="relative w-full sm:w-2/5 shrink-0 h-48 sm:h-full overflow-hidden">
                    {/* Smooth gradient fade blending into the right side */}
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-white/10 to-white z-10 pointer-events-none" />
                    <img
                      src={
                        rm.imageUrl ||
                        (meal as any).imageUrl ||
                        "https://placehold.co/600x400?text=No+Photo"
                      }
                      alt={meal.name}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>

                  {/* Right Content Section */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between relative z-20 sm:mt-0 bg-white sm:bg-transparent rounded-t-3xl sm:rounded-none h-full">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1 mr-2">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {rm.restaurant?.name || "Unknown Restaurant"}
                        </h3>
                        <div className="flex items-center text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold truncate">
                          <MapPin className="w-2.5 h-2.5 mr-1 opacity-60" />
                          {rm.restaurant?.location || "Unknown Location"}
                        </div>
                      </div>
                      <Badge
                        variant={rm.isAvailable ? "default" : "outline"}
                        className={
                          rm.isAvailable
                            ? "bg-green-500 hover:bg-green-600 text-[10px] h-5 px-2 text-white shadow-sm shrink-0"
                            : "text-gray-400 text-[10px] h-5 px-2 shrink-0"
                        }
                      >
                        {rm.isAvailable ? "Available" : "Sold Out"}
                      </Badge>
                    </div>

                    <div className="mt-1.5 mb-2 border-l-2 border-orange-400 pl-3 py-1 bg-gradient-to-r from-orange-50/50 to-transparent rounded-r-lg">
                      <p className="text-[11px] font-black text-gray-700 uppercase tracking-tight truncate">
                        {rm.name}
                      </p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="text-xl font-black text-green-600">
                        {formatPrice(rm.price)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase">
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-blue-500" />
                            {rm.dietaryCategory}
                          </div>
                          <div className="flex items-center gap-1">
                            {rm.spicyLevel && rm.spicyLevel > 0 ? (
                              <>
                                <Flame className="w-2.5 h-2.5 text-orange-500" />
                                {rm.spicyLevel}
                              </>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-[9px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          {getPortionSizeLabel(rm.portionSize)}
                        </div>
                      </div>
                    </div>

                    {rm.ingredients && rm.ingredients.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1">
                        {rm.ingredients.slice(0, 3).map((i) => (
                          <span
                            key={i}
                            className="text-[8px] uppercase tracking-wider font-bold bg-gray-50 px-1.5 py-0.5 rounded text-gray-400 border border-gray-100"
                          >
                            {i}
                          </span>
                        ))}
                        {rm.ingredients.length > 3 && (
                          <span className="text-[8px] text-gray-300 font-medium self-center pl-0.5">
                            +{rm.ingredients.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-gray-900">
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredRestaurants.length,
                )}
              </span>{" "}
              of <span className="font-bold">{filteredRestaurants.length}</span>{" "}
              restaurants
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg h-9 px-3 border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 p-0 rounded-lg ${currentPage === i + 1 ? "bg-blue-600 shadow-lg shadow-blue-200" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="rounded-lg h-9 px-3 border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
