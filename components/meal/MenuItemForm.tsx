"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { X, Upload, ImageIcon } from "lucide-react";
import {
  MenuItemFormData,
  Category,
  MenuItem,
  MenuCategory,
} from "@/lib/types/meal";
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
    type: initialData?.type || undefined,
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
      type: item.type || prev.type,
      tags: item.tags || prev.tags,
    }));
    setTagsText(item.tags?.join(", ") || "");
    if (item.imageId) {
      setImagePreview(`/api/files/${item.imageId}`);
      setRemoveImage(false);
    }
    setShowSuggestions(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeMB = 5;

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: `File type ${file.type} is not allowed. Use JPEG, PNG, or WebP.`,
      }));
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: `File exceeds ${maxSizeMB}MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).`,
      }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
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
      tags: tagsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      image: imageFile || undefined,
      removeImage,
    });
  };

  const inputClass = (hasError?: boolean) =>
    `w-full h-10 rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name + Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Meal Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="e.g. Burger, Shiro, Pizza"
              className={inputClass(!!errors.name)}
              required
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}

            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-auto">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b last:border-0 border-gray-50"
                    onClick={() => selectSuggestion(item)}
                  >
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => handleInputChange("categoryId", e.target.value)}
            className={inputClass(!!errors.categoryId)}
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
            <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>
          )}
        </div>
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={formData.type || ""}
          onChange={(e) =>
            handleInputChange(
              "type",
              (e.target.value as MenuCategory) || undefined,
            )
          }
          className={inputClass()}
        >
          <option value="">Select a type...</option>
          <option value={MenuCategory.MEAL}>Meal</option>
          <option value={MenuCategory.DRINK}>Drink</option>
          <option value={MenuCategory.SIDES}>Sides</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="A general description of this meal type..."
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          className={inputClass()}
          placeholder="fast-food, vegan, popular... (comma separated)"
        />
        {tagsText && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tagsText
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Default Image
        </label>
        <div className="flex flex-col gap-3">
          {imagePreview ? (
            <div className="relative w-full max-w-sm h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-sm h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
              <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />
              <span className="text-xs text-gray-500 font-medium">
                Click to upload
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                JPEG, PNG, or WebP (max 5MB)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          {imagePreview && (
            <label className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-700 transition-colors w-fit">
              <Upload className="h-3.5 w-3.5" />
              Replace image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          {errors.image && (
            <p className="text-xs text-red-500">{errors.image}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
          {initialData?.name ? "Update Meal" : "Create Meal"}
        </Button>
      </div>
    </form>
  );
}
