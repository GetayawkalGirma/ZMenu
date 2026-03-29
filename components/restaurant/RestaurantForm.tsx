"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { RestaurantFeatures } from "@/components/restaurant/RestaurantFeatures";
import {
  RestaurantFormData,
  NoiseLevel,
  PrivacyLevel,
} from "@/lib/types/restaurant";

interface RestaurantFormProps {
  mode: "create" | "edit";
  initialData?: Partial<RestaurantFormData> & { 
    logoUrl?: string;
    menuImageUrl?: string;
    logoId?: string;
    menuImageId?: string;
  };
  onSubmit: (data: RestaurantFormData) => void;
  loading?: boolean;
  restaurantId?: string; // Only for edit mode to show features
}

export function RestaurantForm({
  mode,
  initialData,
  onSubmit,
  loading = false,
  restaurantId,
}: RestaurantFormProps) {
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: initialData?.name || "",
    location: initialData?.location || "",
    features: {
      isLuxury: initialData?.features?.isLuxury || false,
      isGrabAndGo: initialData?.features?.isGrabAndGo || false,
      noiseLevel: initialData?.features?.noiseLevel || NoiseLevel.MODERATE,
      privacyLevel: initialData?.features?.privacyLevel || PrivacyLevel.PUBLIC,
    },
  });

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [removeLogo, setRemoveLogo] = useState(false);

  const [menuImageFile, setMenuImageFile] = useState<File | null>(null);
  const [menuImagePreview, setMenuImagePreview] = useState<string>("");
  const [removeMenuImage, setRemoveMenuImage] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData?.logoUrl) {
      setLogoPreview(initialData.logoUrl);
    } else if (initialData?.logoId) {
      setLogoPreview(`/api/files/${initialData.logoId}`);
    }

    if (initialData?.menuImageUrl) {
      setMenuImagePreview(initialData.menuImageUrl);
    } else if (initialData?.menuImageId) {
      setMenuImagePreview(`/api/files/${initialData.menuImageId}`);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof RestaurantFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeMB = 5;

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        logo: `File type ${file.type} is not allowed.`,
      }));
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
    if (errors.logo) setErrors((prev) => ({ ...prev, logo: "" }));
  };

  const handleMenuImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeMB = 5;

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        menuImage: `File type ${file.type} is not allowed.`,
      }));
      return;
    }

    setMenuImageFile(file);
    setMenuImagePreview(URL.createObjectURL(file));
    setRemoveMenuImage(false);
    if (errors.menuImage) setErrors((prev) => ({ ...prev, menuImage: "" }));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setRemoveLogo(true);
  };

  const handleRemoveMenuImage = () => {
    setMenuImageFile(null);
    setMenuImagePreview("");
    setRemoveMenuImage(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Restaurant name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: RestaurantFormData = {
      ...formData,
      logo: logoFile || undefined,
      menuImage: menuImageFile || undefined,
      removeLogo,
      removeMenuImage,
    };

    onSubmit(submitData);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "Add New Restaurant" : "Edit Restaurant"}
        </h2>
        <p className="mt-2 text-gray-600">
          {mode === "create"
            ? "Fill in the restaurant details below."
            : "Update the restaurant information."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Restaurant Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={errors.name}
            placeholder="Enter restaurant name"
            required
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            error={errors.location}
            placeholder="Enter restaurant location"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Restaurant Logo
            </label>
            <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {logoPreview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white border border-gray-200 group">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove logo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Logo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className={`w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.logo ? 'border-red-500' : ''}`}
              />
              {errors.logo && <p className="text-xs text-red-600 mt-1">{errors.logo}</p>}
            </div>
          </div>

          {/* Menu Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Restaurant Cover / Menu Image
            </label>
            <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {menuImagePreview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white border border-gray-200 group">
                  <img
                    src={menuImagePreview}
                    alt="Menu preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMenuImage}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove menu image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-xs text-center px-2">No Menu Photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleMenuImageChange}
                className={`w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.menuImage ? 'border-red-500' : ''}`}
              />
              {errors.menuImage && <p className="text-xs text-red-600 mt-1">{errors.menuImage}</p>}
            </div>
          </div>
        </div>

        {/* Dynamic Features - Only in Edit Mode */}
        {restaurantId && (
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Restaurant Features
            </label>
            <RestaurantFeatures
              restaurantId={restaurantId}
              selectedFeatures={selectedFeatures}
              onFeaturesChange={setSelectedFeatures}
              disabled={loading}
            />
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button type="submit" loading={loading} disabled={loading} size="lg">
            {mode === "create" ? "Add Restaurant" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
