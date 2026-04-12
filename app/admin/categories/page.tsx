"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { getCategories, createCategory, updateCategory, deleteCategory } from "./actions";
import type { Category } from "@/lib/types/meal";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setError(result.error || "Failed to load categories");
      }
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This may affect meals that use this category.")) {
      return;
    }
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        loadCategories();
      } else {
        alert(`Failed to delete category: ${result.error}`);
      }
    } catch {
      alert("Failed to delete category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, formData);
        if (result.success) {
          setIsModalOpen(false);
          loadCategories();
        } else {
          alert(`Failed to update category: ${result.error}`);
        }
      } else {
        const result = await createCategory(formData);
        if (result.success) {
          setIsModalOpen(false);
          loadCategories();
        } else {
          alert(`Failed to create category: ${result.error}`);
        }
      }
    } catch {
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Categories Management
              </h1>
              <p className="mt-1 text-gray-500 font-medium">
                Create and manage meal categories for organizing your menu items.
              </p>
            </div>
            <Button size="lg" onClick={handleCreateClick} className="shadow-lg shadow-blue-200 shrink-0">
              Create New Category
            </Button>
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
              <div className="text-gray-500 font-medium">Loading categories...</div>
            </div>
          ) : (
            <>
              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-400 mb-4">No categories found</div>
                    <Button onClick={handleCreateClick} variant="outline">
                      Create Your First Category
                    </Button>
                  </div>
                ) : (
                  categories.map((category) => (
                    <Card key={category.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {category.description && (
                          <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(category.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Update Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Breakfast, Lunch, Dinner..."
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                placeholder="Brief description of this category..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : (editingCategory ? "Update" : "Create")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
