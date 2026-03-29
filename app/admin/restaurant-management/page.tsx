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
          <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Restaurant Management
              </h1>
              <p className="mt-1 text-gray-500 font-medium">
                Manage your restaurants and their menus.
              </p>
            </div>
            <Link href="/admin/restaurant-management/new">
              <Button size="lg" className="shadow-lg shadow-blue-200">
                Add New Restaurant
              </Button>
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="mb-6">
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
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4" />
              <div className="text-gray-500 font-medium">Loading restaurants...</div>
            </div>
          ) : restaurants.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="hover:shadow-lg transition-shadow group overflow-hidden"
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        {(restaurant as any).logoUrl ? (
                          <img
                            src={(restaurant as any).logoUrl}
                            alt={restaurant.name || "Restaurant"}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <span className="text-gray-400 text-xl">
                              {restaurant.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate group-hover:text-blue-600 transition-colors">
                            {restaurant.name || "Unnamed Restaurant"}
                          </CardTitle>
                          <p className="text-sm text-gray-500 truncate">
                            {restaurant.location || "No location"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge
                          variant={restaurant.status === "PUBLISHED" ? "default" : "outline"}
                          className={
                            restaurant.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : ""
                          }
                        >
                          {restaurant.status}
                        </Badge>
                        {(restaurant as any).mealCount > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {(restaurant as any).mealCount} items
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-400">
                          {new Date(restaurant.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1.5">
                          <Link href={`/admin/restaurant-management/${restaurant.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/admin/restaurant-management/${restaurant.id}`}>
                            <Button variant="outline" size="sm">
                              View
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
