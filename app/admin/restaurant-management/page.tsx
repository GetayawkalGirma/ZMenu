"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { SearchFilterBar, type FilterConfig } from "@/components/shared/SearchFilterBar";
import { Pagination } from "@/components/shared/Pagination";
import { getPaginatedRestaurants } from "./actions";
import { cn } from "@/lib/utils";

interface RestaurantItem {
  id: string;
  name: string | null;
  location: string | null;
  logoUrl: string | null;
  status: string;
  mealCount?: number;
  avgPrice?: number;
  featureLabels?: string[];
  createdAt: string;
}

const PAGE_SIZE = 9;

const statusFilters: FilterConfig[] = [
  {
    key: "status",
    label: "All Statuses",
    options: [
      { value: "DRAFT", label: "Draft" },
      { value: "PUBLISHED", label: "Published" },
    ],
  },
];

export default function RestaurantManagementPage() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPaginatedRestaurants({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: activeFilters.status || undefined,
      });
      if (result.success && result.data) {
        setRestaurants(result.data.items as any);
        setTotalPages(result.data.totalPages);
        setTotalResults(result.data.total);
      }
    } catch {
      console.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilters]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">
                Restaurants
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium italic">
                Manage your venues and their menus.
              </p>
            </div>
            <Link href="/admin/restaurant-management/new" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-200 uppercase font-black text-[10px] tracking-widest rounded-xl">
                Add New Restaurant
              </Button>
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <SearchFilterBar
              searchValue={search}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search restaurants by name or location..."
              filters={statusFilters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              totalResults={totalResults}
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4" />
              <div className="text-gray-500 font-medium">Loading restaurants...</div>
            </div>
          ) : restaurants.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {restaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="hover:shadow-xl transition-all duration-300 group overflow-hidden border-gray-100 rounded-2xl sm:rounded-3xl flex flex-col"
                  >
                    <CardHeader className="p-3 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
                        {(restaurant as any).logoUrl ? (
                          <img
                            src={(restaurant as any).logoUrl}
                            alt={restaurant.name || "Restaurant"}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-50 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                            <span className="text-blue-400 text-xl font-black">
                              {restaurant.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xs sm:text-xl font-black text-gray-900 truncate uppercase group-hover:text-blue-600 transition-colors">
                            {restaurant.name || "Unnamed"}
                          </CardTitle>
                          <p className="text-[10px] sm:text-sm text-gray-400 font-medium truncate mt-0.5 sm:mt-1 italic">
                            {restaurant.location || "No location"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 flex-1 flex flex-col justify-between">
                      <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 flex-wrap justify-center sm:justify-start">
                        <Badge
                          variant={restaurant.status === "PUBLISHED" ? "default" : "outline"}
                          className={cn(
                            "text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5",
                            restaurant.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "text-gray-400 border-gray-100"
                          )}
                        >
                          {restaurant.status}
                        </Badge>
                        {(restaurant as any).mealCount > 0 && (
                          <Badge variant="secondary" className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border-blue-100 px-2 py-0.5">
                            {(restaurant as any).mealCount} Items
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center pt-2 sm:pt-4 border-t border-gray-50 gap-2 sm:gap-0">
                        <span className="text-[8px] sm:text-xs text-gray-300 font-black uppercase tracking-widest">
                          {new Date(restaurant.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                          <Link href={`/admin/restaurant-management/${restaurant.id}`} className="flex-1 sm:flex-none">
                            <Button variant="outline" size="sm" className="w-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest h-8 sm:h-9 rounded-lg border-gray-100">
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/restaurant-management/${restaurant.id}/edit`} className="flex-1 sm:flex-none">
                            <Button variant="outline" size="sm" className="w-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest h-8 sm:h-9 rounded-lg border-gray-100 bg-gray-900 text-white hover:bg-black hover:text-white border-none">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="text-gray-300 text-5xl mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4c.2.8.9 1.2 1.7 1.2h10.4c.8 0 1.5-.4 1.7-1.2l1.6-7.4"/><path d="m9 11 1 9"/><path d="m15 11-1 9"/></svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {search || activeFilters.status ? "No restaurants match your filters" : "No restaurants yet"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-5">
                    {search || activeFilters.status
                      ? "Try adjusting your search or filters."
                      : "Get started by adding your first restaurant."}
                  </p>
                  {!search && !activeFilters.status && (
                    <Link href="/admin/restaurant-management/new">
                      <Button>Add Your First Restaurant</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
