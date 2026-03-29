"use client";

import { useState, useEffect } from "react";

import { 
  getAllMeals, 
  searchMeals, 
  deleteMeal, 
  createMeal, 
  updateMeal 
} from "./actions";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Badge,
} from "@/components/ui";
import type { MenuItem, MealFormData } from "@/lib/types/meal";
import { MenuItemCard } from "@/components/meal/MenuItemCard";
import { MenuItemForm } from "@/components/meal/MenuItemForm";
import { formatPrice } from "@/lib/utils";

export default function MealsPage() {
  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadMeals();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchMealsList(searchQuery);
    } else {
      setFilteredMeals(meals);
    }
  }, [searchQuery, meals]);

  const loadMeals = async () => {
    setLoading(true);
    try {
      const result = await getAllMeals();
      if (result.success && result.data) {
        setMeals(result.data);
        setFilteredMeals(result.data);
      } else {
        setError(result.error || "Failed to load meals");
      }
    } catch (error) {
      setError("Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  const searchMealsList = async (query: string) => {
    try {
      const result = await searchMeals(query);
      if (result.success && result.data) {
        setFilteredMeals(result.data);
      }
    } catch (error) {
      console.error("Failed to search meals:", error);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal? It will be removed from all restaurants.")) {
      return;
    }

    try {
      const result = await deleteMeal(id);
      if (result.success) {
        setMeals((prev) => prev.filter((meal) => meal.id !== id));
        setFilteredMeals((prev) => prev.filter((meal) => meal.id !== id));
      } else {
        alert(`Failed to delete meal: ${result.error}`);
      }
    } catch (error) {
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
        // Update existing meal
        const result = await updateMeal(editingMeal.id, data);
        if (result.success && result.data) {
          const updatedMeal = result.data as MenuItem;
          setMeals((prev) =>
            prev.map((m) => (m.id === updatedMeal.id ? updatedMeal : m))
          );
          setIsModalOpen(false);
        } else {
          alert(`Failed to update meal: ${result.error}`);
        }
      } else {
        // Create new meal
        const result = await createMeal(data);
        if (result.success && result.data) {
          loadMeals();
          setIsModalOpen(false);
        } else {
          alert(`Failed to create meal: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Failed to save meal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Meals Management
              </h1>
              <p className="mt-1 text-gray-500 font-medium">
                Create and manage global meals that can be used across all restaurants.
              </p>
            </div>
            <Button size="lg" onClick={handleCreateClick} className="shadow-lg shadow-blue-200">
              Create New Global Meal
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search global directory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 h-11 border-gray-200 focus:border-blue-500 transition-all rounded-lg"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <div className="text-gray-500 font-medium">Fetching global menu items...</div>
            </div>
          ) : (
            /* Meals Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeals.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-gray-400 mb-4">No meals found in the directory</div>
                  {!searchQuery && (
                    <Button onClick={handleCreateClick} variant="outline">Initialize Your First Meal</Button>
                  )}
                </div>
              ) : (
                filteredMeals.map((meal) => (
                  <MenuItemCard
                    key={meal.id}
                    menuItem={meal}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteMeal}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl sm:rounded-2xl border-none shadow-2xl p-0">
          <div className="p-6 border-b border-gray-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
                {editingMeal ? "Update Global Item" : "New Global Entry"}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <MenuItemForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
              initialData={editingMeal ? {
                name: editingMeal.name,
                description: editingMeal.description || "",
                categoryId: editingMeal.categoryId,
                tags: editingMeal.tags || [],
                imageUrl: (editingMeal as any).imageUrl || (editingMeal.imageId ? `/api/files/${editingMeal.imageId}` : ""),
              } : undefined}
              loading={saving}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
