"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { MealFormData, PortionSize, MenuItem, Category } from "@/lib/types/meal";
import { searchMenuItems, getCategories } from "@/app/admin/restaurant-management/menu-item-actions";

interface MealFormProps {
  onSubmit: (data: MealFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<MealFormData>;
  loading?: boolean;
  mode?: "global" | "restaurant";
}

export function MealForm({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
  mode = "restaurant",
}: MealFormProps) {
  const [formData, setFormData] = useState<MealFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    portionSize: initialData?.portionSize || PortionSize.ONE_PERSON,
    ingredients: initialData?.ingredients || [],
    calories: initialData?.calories || 0,
    isAvailable: initialData?.isAvailable ?? true,
    isPopular: initialData?.isPopular || false,
    isRecommended: initialData?.isRecommended || false,
    imageUrl: initialData?.imageUrl || "",
    sortOrder: initialData?.sortOrder || 0,
    categoryId: initialData?.categoryId || "",
    tags: initialData?.tags || [],
    restName: initialData?.restName || "",
    restDescription: initialData?.restDescription || "",
    spicyLevel: initialData?.spicyLevel || 0,
  });

  const [ingredientsText, setIngredientsText] = useState(
    initialData?.ingredients?.join(", ") || "",
  );
  const [tagsText, setTagsText] = useState(
    initialData?.tags?.join(", ") || "",
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data as Category[]);
      }
    }
    fetchCategories();
  }, []);

  const handleInputChange = (field: keyof MealFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Handle name search for suggestions
    if (field === "name" && mode === "restaurant" && value.length >= 2) {
      handleSearch(value);
    } else if (field === "name") {
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearching(true);
    try {
      const result = await searchMenuItems(query);
      if (result.success && result.data) {
        setSuggestions(result.data);
        setShowSuggestions(result.data.length > 0);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const selectSuggestion = (item: MenuItem) => {
    setFormData((prev) => ({
      ...prev,
      name: item.name,
      description: item.description || prev.description,
      restName: prev.restName || item.name, // Suggest master name as restaurant name
      restDescription: prev.restDescription || item.description || "",
      categoryId: item.categoryId || prev.categoryId,
      tags: item.tags || prev.tags,
    }));
    setTagsText(item.tags?.join(", ") || "");
    setShowSuggestions(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setFormData(prev => ({ ...prev, removeImage: false }));

    // Create preview
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    // Clear any existing image error
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, removeImage: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Meal name is required";
    }

    if (mode === "restaurant") {
      if (!formData.price || formData.price <= 0) {
        newErrors.price = "Price must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: MealFormData = {
      ...formData,
      ingredients: ingredientsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      tags: tagsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      image: imageFile || undefined,
    };

    onSubmit(submitData);
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {initialData?.name ? "Edit Meal" : "Add New Meal"}
        </h3>
        <p className="text-sm text-gray-600">Fill in the meal details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Global Information */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Global Information (Abstract Meal)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Step 1: Choose Master Item
              </label>
              <Input
                label="General Category Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={errors.name}
                placeholder="search e.g. Burger, Pizza..."
                required
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="bg-white"
              />
              
              {showSuggestions && mode === "restaurant" && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto border-t-0 rounded-t-none">
                  <div className="p-2 bg-gray-50 border-b text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Global Suggestions
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 transition-colors border-b last:border-0"
                      onClick={() => selectSuggestion(item)}
                    >
                      <div className="font-bold text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Global Classification
              </label>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.categoryId || "temp-category"}
                onChange={(e) =>
                  handleInputChange("categoryId", e.target.value)
                }
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                <option value="temp-category">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              placeholder="General description of this meal..."
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <textarea
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              rows={1}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              placeholder="fast-food, ethiopian, vegan... (comma separated)"
            />
          </div>
        </div>

        {/* Restaurant Specific Settings */}
        {mode === "restaurant" && (
          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 shadow-sm">
            <h4 className="flex items-center text-sm font-bold text-blue-800 uppercase tracking-wider mb-4">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2">2</span>
              Step 2: Restaurant's Specific Offer
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-blue-900 group">
                  Restaurant Specific Name
                  <span className="block text-[10px] font-normal text-blue-600 uppercase tracking-tight">How it appears on your menu (e.g. "Killer Burger")</span>
                </label>
                <Input
                  value={formData.restName}
                  onChange={(e) => handleInputChange("restName", e.target.value)}
                  placeholder="e.g. Sheraton Special Cheese Burger"
                  className="border-blue-300 focus:ring-blue-500 bg-white font-semibold"
                />
              </div>

              <div className="space-y-2 group">
                <label className="block text-sm font-bold text-blue-900">
                  Specific Description
                  <span className="block text-[10px] font-normal text-blue-600 uppercase tracking-tight">The unique story or recipe for your version</span>
                </label>
                <textarea
                  value={formData.restDescription}
                  onChange={(e) => handleInputChange("restDescription", e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="This burger is made with 100% prime beef..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Local Price (ETB)"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", parseFloat(e.target.value) || 0)
                }
                error={errors.price}
                placeholder="0.00"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portion Size
                </label>
                <select
                  value={formData.portionSize || PortionSize.ONE_PERSON}
                  onChange={(e) =>
                    handleInputChange("portionSize", e.target.value as PortionSize)
                  }
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <option value={PortionSize.ONE_PERSON}>One Person</option>
                  <option value={PortionSize.TWO_PEOPLE}>Two People</option>
                  <option value={PortionSize.THREE_PEOPLE}>Three People</option>
                  <option value={PortionSize.FAMILY}>Family</option>
                </select>
              </div>

              <Input
                label="Preparation Time (min)"
                type="number"
                value={formData.preparationTime}
                onChange={(e) =>
                  handleInputChange("preparationTime", parseInt(e.target.value) || 0)
                }
                placeholder="minutes"
              />

              <Input
                label="Calories"
                type="number"
                value={formData.calories}
                onChange={(e) =>
                  handleInputChange("calories", parseInt(e.target.value) || 0)
                }
                placeholder="Kcal"
              />

              <Input
                label="Spicy Level (0-5)"
                type="number"
                min="0"
                max="5"
                value={formData.spicyLevel}
                onChange={(e) =>
                  handleInputChange("spicyLevel", parseInt(e.target.value) || 0)
                }
                placeholder="0"
              />
            </div>

            <div className="mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients / Recipe
                </label>
                <textarea
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  placeholder="e.g. Beef, Bun, Cheese..."
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Highlights */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={formData.isPopular}
                    onChange={(e) => handleInputChange("isPopular", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPopular" className="ml-2 text-sm text-gray-700">
                    🔥 Popular (Featured)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRecommended"
                    checked={formData.isRecommended}
                    onChange={(e) => handleInputChange("isRecommended", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isRecommended" className="ml-2 text-sm text-gray-700">
                    ⭐ Recommended
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => handleInputChange("isAvailable", e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700 font-medium">
                  Currently Available
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
            Meal Appearance
          </label>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-40 h-40 rounded-xl overflow-hidden bg-white border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Meal preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-1 text-xs text-gray-400 font-medium">No Image</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                error={errors.image}
                className="cursor-pointer"
              />
              <p className="mt-2 text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                Recommended: 800x600px, Under 5MB
              </p>
            </div>
          </div>
        </div>


        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}

          <Button type="submit" loading={loading} disabled={loading}>
            {initialData?.name ? "Save Changes" : (mode === "global" ? "Create Global Meal" : "Add to Restaurant")}
          </Button>
        </div>
      </form>
    </div>
  );
}
