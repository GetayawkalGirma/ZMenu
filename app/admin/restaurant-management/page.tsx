"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  Badge,
} from "@/components/ui";
import { SearchFilterBar, type FilterConfig } from "@/components/shared/SearchFilterBar";
import { Pagination } from "@/components/shared/Pagination";
import { getPaginatedRestaurants, deleteRestaurant } from "./actions";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui";

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
const SESSION_KEY = "restaurant_list_filters";

const statusFilters: FilterConfig[] = [
  {
    key: "status",
    label: "All Statuses",
    options: [
      { value: "DRAFT", label: "Draft" },
      { value: "PUBLISHED", label: "Published" },
    ],
  },
  {
    key: "sortBy",
    label: "Created date",
    options: [
      { value: "created-desc", label: "Newest first" },
      { value: "created-asc", label: "Oldest first" },
    ],
  },
];

function RestaurantListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string | null } | null>(null);

  const openDeleteDialog = useCallback((id: string, name: string | null, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete({ id, name });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setDeletingId(id);
    try {
      const result = await deleteRestaurant(id);
      if (result.success) {
        setRestaurants((prev) => prev.filter((r) => r.id !== id));
        setTotalResults((prev) => prev - 1);
        setConfirmDelete(null);
      } else {
        alert("Failed to delete: " + result.error);
      }
    } catch {
      alert("Failed to delete restaurant");
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete]);

  // On first load: if URL has no params, restore from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined" || !searchParams) return;
    const hasUrlParams =
      searchParams.get("status") ||
      searchParams.get("search") ||
      searchParams.get("page") ||
      searchParams.get("sortBy");
    if (!hasUrlParams) {
      try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, string>;
          const params = new URLSearchParams(parsed);
          if (params.toString()) {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          }
        }
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const page = parseInt(searchParams?.get("page") || "1", 10);
  const search = searchParams?.get("search") || "";
  const statusFilter = searchParams?.get("status") || "";
  const sortByFilter = searchParams?.get("sortBy") || "";

  // Debounce timer for search input
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Persist to sessionStorage so any link back to this page restores the filter
      try {
        const toSave: Record<string, string> = {};
        params.forEach((v, k) => { toSave[k] = v; });
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(toSave));
      } catch { /* ignore */ }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        updateURL({ search: value || null, page: null });
      }, 300);
    },
    [updateURL]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      updateURL({ [key]: value || null, page: null });
    },
    [updateURL]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateURL({ page: newPage > 1 ? String(newPage) : null });
    },
    [updateURL]
  );

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPaginatedRestaurants({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy: sortByFilter || undefined,
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
  }, [page, search, statusFilter, sortByFilter]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Sync sessionStorage when URL params change externally (e.g. browser back/forward)
  useEffect(() => {
    try {
      const toSave: Record<string, string> = {};
      searchParams?.forEach((v, k) => { toSave[k] = v; });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(toSave));
    } catch { /* ignore */ }
  }, [searchParams]);

  const activeFilters: Record<string, string> = {};
  if (statusFilter) activeFilters.status = statusFilter;
  if (sortByFilter) activeFilters.sortBy = sortByFilter;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">
                Restaurants
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium italic">
                {totalResults > 0 ? `${totalResults} venue${totalResults !== 1 ? "s" : ""}` : "Manage your venues and their menus."}
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

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="p-3 sm:p-6 flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-3">
                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                    <div className="flex gap-2 pt-2 border-t border-gray-50">
                      <div className="h-8 bg-gray-100 rounded-lg flex-1" />
                      <div className="h-8 bg-gray-100 rounded-lg flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {restaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="hover:shadow-xl transition-all duration-300 group overflow-hidden border-gray-100 rounded-2xl sm:rounded-3xl flex flex-col"
                  >
                    <div className="p-3 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
                        {(restaurant as any).logoUrl ? (
                          <img
                            src={(restaurant as any).logoUrl}
                            alt={restaurant.name || "Restaurant"}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-50 shadow-sm"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                            <span className="text-blue-400 text-xl font-black">
                              {restaurant.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-xl font-black text-gray-900 truncate uppercase group-hover:text-blue-600 transition-colors">
                            {restaurant.name || "Unnamed"}
                          </p>
                          <p className="text-[10px] sm:text-sm text-gray-400 font-medium truncate mt-0.5 sm:mt-1 italic">
                            {restaurant.location || "No location"}
                          </p>
                        </div>
                      </div>
                    </div>
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
                          <button
                            onClick={(e) => openDeleteDialog(restaurant.id, restaurant.name, e)}
                            disabled={deletingId === restaurant.id}
                            className="flex-none flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 rounded-lg border border-red-100 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors disabled:opacity-40"
                            title="Delete restaurant"
                          >
                            {deletingId === restaurant.id ? (
                              <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
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
                  onPageChange={handlePageChange}
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
                    {search || statusFilter || sortByFilter
                      ? "No restaurants match your filters"
                      : "No restaurants yet"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-5">
                    {search || statusFilter || sortByFilter
                      ? "Try adjusting your search or filters."
                      : "Get started by adding your first restaurant."}
                  </p>
                  {!search && !statusFilter && !sortByFilter && (
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

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
        title="Delete Restaurant"
        description={`"${confirmDelete?.name || "This restaurant"}" will be permanently removed along with all its menu items and images. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={!!deletingId}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function RestaurantManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
      </div>
    }>
      <RestaurantListInner />
    </Suspense>
  );
}
