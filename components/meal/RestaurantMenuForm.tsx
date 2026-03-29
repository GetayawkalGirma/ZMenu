"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { X, Upload, ImageIcon } from "lucide-react";
import {
  RestaurantMenuFormData,
  PortionSize,
  FoodCategoryType,
  DietaryCategory,
  RestaurantMenu,
} from "@/lib/types/meal";

interface RestaurantMenuFormProps {
  onSubmit: (data: RestaurantMenuFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<RestaurantMenu>;
  restaurantId: string;
  menuItemId: string;
  menuItemName?: string;
  loading?: boolean;
}

export function RestaurantMenuForm({
  onSubmit,
  onCancel,
  initialData,
  restaurantId,
  menuItemId,
  menuItemName,
  loading = false,
}: RestaurantMenuFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    foodCategoryType: initialData?.foodCategoryType || ("" as string),
    dietaryCategory: initialData?.dietaryCategory || ("" as string),
    price: initialData?.price || 0,
    portionSize: initialData?.portionSize || ("" as string),
    spicyLevel: initialData?.spicyLevel || 0,
    preparationTime: initialData?.preparationTime || 0,
    calories: initialData?.calories || 0,
    isAvailable: initialData?.isAvailable ?? true,
    isPopular: initialData?.isPopular || false,
    isRecommended: initialData?.isRecommended || false,
    sortOrder: initialData?.sortOrder || 0,
  });

  const [ingredientsText, setIngredientsText] = useState(
    initialData?.ingredients?.join(", ") || "",
  );
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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Use JPEG, PNG, or WebP format.",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: `File exceeds 5MB (${(file.size / 1024 / 1024).toFixed(1)}MB).`,
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
    const newErrors: Record<string, string> = {};
    if (formData.price <= 0) newErrors.price = "Price is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      restaurantId,
      menuItemId,
      name: formData.name || undefined,
      description: formData.description || undefined,
      foodCategoryType: (formData.foodCategoryType as FoodCategoryType) || undefined,
      dietaryCategory: (formData.dietaryCategory as DietaryCategory) || undefined,
      price: formData.price,
      portionSize: (formData.portionSize as PortionSize) || undefined,
      spicyLevel: formData.spicyLevel || undefined,
      preparationTime: formData.preparationTime || undefined,
      calories: formData.calories || undefined,
      isAvailable: formData.isAvailable,
      isPopular: formData.isPopular,
      isRecommended: formData.isRecommended,
      sortOrder: formData.sortOrder || undefined,
      ingredients: ingredientsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      image: imageFile || undefined,
      removeImage,
    } as RestaurantMenuFormData);
  };

  const inputClass = (hasError?: boolean) =>
    `w-full h-10 rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {menuItemName && (
        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
          Customizing: <span className="text-gray-900">{menuItemName}</span>
        </div>
      )}

      {/* Name & Description Overrides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Restaurant-Specific Name
          </label>
          <input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. Killer Burger, Sheraton Special..."
            className={inputClass()}
          />
          <p className="text-[11px] text-gray-400">
            How this item appears on your menu
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Specific Description
          </label>
          <input
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Your unique version or recipe..."
            className={inputClass()}
          />
        </div>
      </div>

      {/* Type Dropdowns + Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Food Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.foodCategoryType}
            onChange={(e) => handleChange("foodCategoryType", e.target.value)}
            className={inputClass()}
          >
            <option value="">Select type...</option>
            {Object.values(FoodCategoryType).map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Dietary Category
          </label>
          <select
            value={formData.dietaryCategory}
            onChange={(e) => handleChange("dietaryCategory", e.target.value)}
            className={inputClass()}
          >
            <option value="">Select dietary...</option>
            {Object.values(DietaryCategory).map((d) => (
              <option key={d} value={d}>
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Price (ETB) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price || ""}
            onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={inputClass(!!errors.price)}
            required
          />
          {errors.price && (
            <p className="text-xs text-red-500">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Portion, Prep, Spicy, Calories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Portion Size
          </label>
          <select
            value={formData.portionSize}
            onChange={(e) => handleChange("portionSize", e.target.value)}
            className={inputClass()}
          >
            <option value="">Select...</option>
            {Object.values(PortionSize).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ").charAt(0) +
                  s.replace(/_/g, " ").slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Prep Time (min)
          </label>
          <input
            type="number"
            min="0"
            value={formData.preparationTime || ""}
            onChange={(e) =>
              handleChange("preparationTime", parseInt(e.target.value) || 0)
            }
            placeholder="15"
            className={inputClass()}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Spicy Level (0-5)
          </label>
          <input
            type="number"
            min="0"
            max="5"
            value={formData.spicyLevel || ""}
            onChange={(e) =>
              handleChange("spicyLevel", parseInt(e.target.value) || 0)
            }
            placeholder="0"
            className={inputClass()}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Calories
          </label>
          <input
            type="number"
            min="0"
            value={formData.calories || ""}
            onChange={(e) =>
              handleChange("calories", parseInt(e.target.value) || 0)
            }
            placeholder="Kcal"
            className={inputClass()}
          />
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Ingredients / Recipe
        </label>
        <textarea
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Beef, Bun, Cheese, Lettuce... (comma separated)"
        />
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isAvailable}
            onChange={(e) => handleChange("isAvailable", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Currently Available
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isPopular}
            onChange={(e) => handleChange("isPopular", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Popular (Featured)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isRecommended}
            onChange={(e) => handleChange("isRecommended", e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Recommended
        </label>
      </div>

      {/* Image */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Restaurant-Specific Photo
        </label>
        <div className="flex flex-col gap-3">
          {imagePreview ? (
            <div className="relative w-full max-w-xs h-36 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
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
            <label className="flex flex-col items-center justify-center w-full max-w-xs h-28 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
              <ImageIcon className="h-7 w-7 text-gray-300 mb-1.5" />
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
            <label className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-700 w-fit">
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
          {initialData?.id ? "Save Changes" : "Add to Restaurant"}
        </Button>
      </div>
    </form>
  );
}
