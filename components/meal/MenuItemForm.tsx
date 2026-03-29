"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui";
import { MenuItemFormData, Category, MenuItem } from "@/lib/types/meal";
import {
  searchMenuItems,
  getCategories,
} from "@/app/admin/restaurant-management/menu-item-actions";

interface MenuItemFormProps {
  onSubmit: (data: MenuItemFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<MenuItemFormData>;
  loading?: boolean;
}

export function MenuItemForm({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}: MenuItemFormProps) {
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || "",
    tags: initialData?.tags || [],
  });

  const [tagsText, setTagsText] = useState(initialData?.tags?.join(", ") || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [removeImage, setRemoveImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData?.imageUrl]);

  useEffect(() => {
    async function loadCategories() {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    }
    loadCategories();
  }, []);

  const handleInputChange = (field: keyof MenuItemFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "name" && value.length >= 2) {
      handleSearch(value);
    } else if (field === "name") {
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const result = await searchMenuItems(query);
      if (result.success && result.data) {
        setSuggestions(result.data);
        setShowSuggestions(result.data.length > 0);
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const selectSuggestion = (item: MenuItem) => {
    setFormData((prev) => ({
      ...prev,
      name: item.name,
      description: item.description || "",
      categoryId: item.categoryId,
      tags: item.tags || prev.tags,
    }));
    setTagsText(item.tags?.join(", ") || "");
    
    // Pre-populate image from suggestion if it exists
    if (item.imageId) {
      const url = `/api/files/${item.imageId}`;
      setImagePreview(url);
      setRemoveImage(false);
    }
    
    setShowSuggestions(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeMB = 5;

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      }));
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrors((prev) => ({
        ...prev,
        image: `File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
    
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setRemoveImage(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...formData,
      tags: tagsText.split(",").map(s => s.trim()).filter(s => s !== ""),
      image: imageFile || undefined,
      removeImage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Menu Item Information (Abstract)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fix: Suggestions dropdown positioned relative to a wrapper around the input field alone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Meal Name
            </label>
            <div className="relative">
              <input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="e.g. Beef Burger"
                className={`w-full h-10 rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                required
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}

              {showSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto top-full left-0">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 transition-colors border-b last:border-0 border-gray-100"
                      onClick={() => selectSuggestion(item)}
                    >
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {item.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange("categoryId", e.target.value)}
              className={`w-full h-10 rounded-md border bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${errors.categoryId ? "border-red-500" : "border-gray-300"}`}
              required
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-600 mt-1">{errors.categoryId}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={2}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="General description..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="fast-food, vegan... (comma separated)"
          />
        </div>

        {/* Global Image Upload */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Meal Image (Global)
          </label>
          <div className="flex flex-col space-y-3">
            {imagePreview && (
              <div className="relative w-full max-w-sm h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                <img
                  src={imagePreview}
                  alt="Global preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.image ? 'border-red-500' : ''}`}
              />
              {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}
              <p className="text-xs text-gray-500 mt-2">
                Upload a default photo for this meal type (JPEG, PNG, or WebP, max 5MB). 
                Restaurants can override this with their own photos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={loading}>
          {initialData?.name ? "Update Menu Item" : "Create Menu Item"}
        </Button>
      </div>
    </form>
  );
}
