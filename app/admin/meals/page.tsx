"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPaginatedMeals,
  getCategories,
  deleteMeal,
  createMeal,
  updateMeal,
} from "./actions";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import type { MenuItem, Category } from "@/lib/types/meal";
import { MenuItemCard } from "@/components/meal/MenuItemCard";
import { MenuItemForm } from "@/components/meal/MenuItemForm";
import { SearchFilterBar, type FilterConfig } from "@/components/shared/SearchFilterBar";
import { Pagination } from "@/components/shared/Pagination";

const PAGE_SIZE = 12;

export default function MealsPage() {
  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination + filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMeals();
  }, [page, searchQuery, categoryFilter]);

  const loadCategories = async () => {
    const result = await getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
  };

  const loadMeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPaginatedMeals({
        page,
        pageSize: PAGE_SIZE,
        search: searchQuery || undefined,
        categoryId: categoryFilter || undefined,
      });
      if (result.success && result.data) {
        setMeals(result.data);
        setTotalPages(result.totalPages ?? 1);
        setTotalResults(result.total ?? 0);
      } else {
        setError(result.error || "Failed to load meals");
      }
    } catch {
      setError("Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    if (key === "category") {
      setCategoryFilter(value);
      setPage(1);
    }
  }, []);

  const handleDeleteMeal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal? It will be removed from all restaurants.")) {
      return;
    }
    try {
      const result = await deleteMeal(id);
      if (result.success) {
        loadMeals();
      } else {
        alert(`Failed to delete meal: ${result.error}`);
      }
    } catch {
      alert("Failed to delete meal");
    }
  };

  const handleEditClick = (meal: MenuItem) => {
    setEditingMeal(meal);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingMeal(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setSaving(true);
    try {
      if (editingMeal) {
        const result = await updateMeal(editingMeal.id, data);
        if (result.success) {
          setIsModalOpen(false);
          loadMeals();
        } else {
          alert(`Failed to update meal: ${result.error}`);
        }
      } else {
        const result = await createMeal(data);
        if (result.success) {
          setIsModalOpen(false);
          loadMeals();
        } else {
          alert(`Failed to create meal: ${result.error}`);
        }
      }
    } catch {
      alert("Failed to save meal");
    } finally {
      setSaving(false);
    }
  };

  const categoryFilterConfig: FilterConfig[] = categories.length > 0
    ? [
        {
          key: "category",
          label: "All Categories",
          options: categories.map((c) => ({ value: c.id, label: c.name })),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Meals Management
              </h1>
              <p className="mt-1 text-gray-500 font-medium">
                Create and manage global meals that can be used across all restaurants.
              </p>
            </div>
            <Button size="lg" onClick={handleCreateClick} className="shadow-lg shadow-blue-200 shrink-0">
              Create New Meal
            </Button>
          </div>

          {/* Search + Filters */}
          <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <SearchFilterBar
              searchValue={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search meals by name, description, or tag..."
              filters={categoryFilterConfig}
              activeFilters={{ category: categoryFilter }}
              onFilterChange={handleFilterChange}
              totalResults={totalResults}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center">
              <svg className="w-5 h-5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4" />
              <div className="text-gray-500 font-medium">Loading meals...</div>
            </div>
          ) : (
            <>
              {/* Meals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-400 mb-4">
                      {searchQuery || categoryFilter
                        ? "No meals match your filters"
                        : "No meals found in the directory"}
                    </div>
                    {!searchQuery && !categoryFilter && (
                      <Button onClick={handleCreateClick} variant="outline">
                        Create Your First Meal
                      </Button>
                    )}
                  </div>
                ) : (
                  meals.map((meal) => (
                    <MenuItemCard
                      key={meal.id}
                      menuItem={meal}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteMeal}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-2xl border-none shadow-2xl p-0 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="p-6 border-b border-gray-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
                {editingMeal ? "Update Meal" : "Create New Meal"}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <MenuItemForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
              initialData={
                editingMeal
                  ? {
                      name: editingMeal.name,
                      description: editingMeal.description || "",
                      categoryId: editingMeal.categoryId,
                      tags: editingMeal.tags || [],
                      imageUrl:
                        (editingMeal as any).imageUrl ||
                        (editingMeal.imageId
                          ? `/api/files/${editingMeal.imageId}`
                          : ""),
                    }
                  : undefined
              }
              loading={saving}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
