"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
} from "@/components/ui";
import { RestaurantMenuFormData, PortionSize, RestaurantMenu } from "@/lib/types/meal";

interface RestaurantMenuFormProps {
  onSubmit: (data: RestaurantMenuFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<RestaurantMenu>;
  restaurantId: string;
  menuItemId: string;
  loading?: boolean;
}

export function RestaurantMenuForm({
  onSubmit,
  onCancel,
  initialData,
  restaurantId,
  menuItemId,
  loading = false,
}: RestaurantMenuFormProps) {
  const [formData, setFormData] = useState<Omit<RestaurantMenuFormData, "image" | "restaurantId" | "menuItemId">>({
    price: initialData?.price || 0,
    portionSize: initialData?.portionSize || PortionSize.ONE_PERSON,
    ingredients: initialData?.ingredients || [],
    calories: initialData?.calories || 0,
    isAvailable: initialData?.isAvailable ?? true,
    isPopular: initialData?.isPopular || false,
    isRecommended: initialData?.isRecommended || false,
    imageUrl: initialData?.imageUrl || "",
    sortOrder: initialData?.sortOrder || 0,
    spicyLevel: initialData?.spicyLevel || 0,
    preparationTime: initialData?.preparationTime || 0,
  });

  const [ingredientsText, setIngredientsText] = useState(initialData?.ingredients?.join(", ") || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
    } else if (initialData?.imageId) {
      setImagePreview(`/api/files/${initialData.imageId}`);
    }
  }, [initialData?.imageUrl, initialData?.imageId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setRemoveImage(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.price <= 0) {
      setErrors(prev => ({ ...prev, price: "Price must be greater than 0" }));
      return;
    }

    onSubmit({
      ...formData,
      restaurantId,
      menuItemId,
      image: imageFile || undefined,
      removeImage,
      ingredients: ingredientsText.split(",").map(s => s.trim()).filter(s => s !== ""),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
        <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-4">
          Restaurant-Specific Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Local Price (ETB)"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
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
              onChange={(e) => handleInputChange("portionSize", e.target.value as PortionSize)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(PortionSize).map(size => (
                <option key={size} value={size}>{size.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <Input
            label="Preparation Time (min)"
            type="number"
            value={formData.preparationTime}
            onChange={(e) => handleInputChange("preparationTime", parseInt(e.target.value) || 0)}
            placeholder="minutes"
          />

          <Input
            label="Calories"
            type="number"
            value={formData.calories}
            onChange={(e) => handleInputChange("calories", parseInt(e.target.value) || 0)}
            placeholder="Kcal"
          />

          <Input
            label="Spicy Level (0-5)"
            type="number"
            min="0"
            max="5"
            value={formData.spicyLevel}
            onChange={(e) => handleInputChange("spicyLevel", parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients / Recipe (Local)
          </label>
          <textarea
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Beef, Bun, Cheese..."
          />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meal Photo Override (Specific to this Restaurant)
        </label>
        <div className="flex flex-col space-y-3">
          {imagePreview && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.image ? 'border-red-500' : ''}`}
            />
            {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={loading}>
          {initialData?.id ? "Save Overrides" : "Add to Restaurant"}
        </Button>
      </div>
    </form>
  );
}
