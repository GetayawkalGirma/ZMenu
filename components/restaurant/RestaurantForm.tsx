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
import { RestaurantImagePickerDialog } from "@/components/meal/RestaurantImagePickerDialog";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, Image as ImageIcon, Plus, ExternalLink, Info, X } from "lucide-react";
import { getRestaurantImagePool } from "@/app/admin/restaurant-management/menu-item-actions";
import { RestaurantImageOption } from "@/lib/types/meal";

interface RestaurantFormProps {
  mode: "create" | "edit";
  initialData?: Partial<RestaurantFormData> & {
    logoUrl?: string;
    menuImageUrl?: string;
    logoId?: string;
    menuImageId?: string;
  };
  onSubmit: (data: RestaurantFormData & { featureIds?: string[] }) => void;
  loading?: boolean;
  restaurantId?: string;
  initialFeatureIds?: string[];
}

export function RestaurantForm({
  mode,
  initialData,
  onSubmit,
  loading = false,
  restaurantId,
  initialFeatureIds,
}: RestaurantFormProps) {
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: initialData?.name || "",
    location: initialData?.location || "",
    geoLocation: initialData?.geoLocation || "",
    status: initialData?.status || "DRAFT",
    features: {
      isLuxury: initialData?.features?.isLuxury || false,
      isGrabAndGo: initialData?.features?.isGrabAndGo || false,
      noiseLevel: initialData?.features?.noiseLevel || NoiseLevel.MODERATE,
      privacyLevel: initialData?.features?.privacyLevel || PrivacyLevel.PUBLIC,
    },
    latitude: initialData?.latitude || undefined,
    longitude: initialData?.longitude || undefined,
  });

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    initialFeatureIds || [],
  );

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(
    initialData?.logoId || null,
  );
  const [logoPreview, setLogoPreview] = useState<string>(
    initialData?.logoUrl || "",
  );
  const [removeLogo, setRemoveLogo] = useState(false);
  const [showLogoPicker, setShowLogoPicker] = useState(false);

  const [menuImageFile, setMenuImageFile] = useState<File | null>(null);
  const [selectedMenuImageId, setSelectedMenuImageId] = useState<string | null>(
    initialData?.menuImageId || null,
  );
  const [menuImagePreview, setMenuImagePreview] = useState<string>(
    initialData?.menuImageUrl || "",
  );
  const [removeMenuImage, setRemoveMenuImage] = useState(false);
  const [showMenuImagePicker, setShowMenuImagePicker] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [libraryImages, setLibraryImages] = useState<RestaurantImageOption[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Fetch library images if in edit mode
  useEffect(() => {
    console.log("RestaurantForm: restaurantId is", restaurantId);
    if (restaurantId) {
      setLoadingLibrary(true);
      getRestaurantImagePool(restaurantId)
        .then((result) => {
          console.log("RestaurantForm: getRestaurantImagePool result:", result);
          if (result.success && result.data) {
            setLibraryImages(result.data);
          }
        })
        .finally(() => setLoadingLibrary(false));
    }
  }, [restaurantId]);

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

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        logo: `File type ${file.type} is not allowed.`,
      }));
      return;
    }

    setLogoFile(file);
    setSelectedLogoId(null);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
    if (errors.logo) setErrors((prev) => ({ ...prev, logo: "" }));
  };

  const handleMenuImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        menuImage: `File type ${file.type} is not allowed.`,
      }));
      return;
    }

    setMenuImageFile(file);
    setSelectedMenuImageId(null);
    setMenuImagePreview(URL.createObjectURL(file));
    setRemoveMenuImage(false);
    if (errors.menuImage) setErrors((prev) => ({ ...prev, menuImage: "" }));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setSelectedLogoId(null);
    setLogoPreview("");
    setRemoveLogo(true);
  };

  const handleRemoveMenuImage = () => {
    setMenuImageFile(null);
    setSelectedMenuImageId(null);
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

    const submitData = {
      ...formData,
      logo: logoFile || undefined,
      logoId: selectedLogoId || undefined,
      menuImage: menuImageFile || undefined,
      menuImageId: selectedMenuImageId || undefined,
      removeLogo,
      removeMenuImage,
      featureIds: selectedFeatures,
    };

    onSubmit(submitData);
  };

  const toggleStatus = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
    }));
  };

  return (
    <div className="w-full">
      {restaurantId && (
        <>
          <RestaurantImagePickerDialog
            open={showLogoPicker}
            onOpenChange={setShowLogoPicker}
            restaurantId={restaurantId}
            title="Choose Restaurant Logo from Library"
            currentImageId={selectedLogoId}
            onSelect={(image) => {
              setLogoFile(null);
              setRemoveLogo(false);
              setSelectedLogoId(image.imageId);
              setLogoPreview(image.imageUrl);
              if (errors.logo) setErrors((prev) => ({ ...prev, logo: "" }));
            }}
          />
          <RestaurantImagePickerDialog
            open={showMenuImagePicker}
            onOpenChange={setShowMenuImagePicker}
            restaurantId={restaurantId}
            title="Choose Cover Image from Library"
            currentImageId={selectedMenuImageId}
            onSelect={(image) => {
              setMenuImageFile(null);
              setRemoveMenuImage(false);
              setSelectedMenuImageId(image.imageId);
              setMenuImagePreview(image.imageUrl);
              if (errors.menuImage) {
                setErrors((prev) => ({ ...prev, menuImage: "" }));
              }
            }}
          />
        </>
      )}

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
        {/* Status Section */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                formData.status === "PUBLISHED"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600",
              )}
            >
              {formData.status === "PUBLISHED" ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                Publication Status
              </h3>
              <p className="text-xs text-gray-500">
                {formData.status === "PUBLISHED"
                  ? "Currently visible to all public users."
                  : "Currently hidden from search results."}
              </p>
            </div>
          </div>
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleInputChange("status", "DRAFT")}
              className={cn(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all",
                formData.status === "DRAFT"
                  ? "bg-yellow-500 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => handleInputChange("status", "PUBLISHED")}
              className={cn(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all",
                formData.status === "PUBLISHED"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              Published
            </button>
          </div>
        </div>

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
        <div>
          <Input
            label="Geo Location (Link, Coordinates, or Embed)"
            value={formData.geoLocation}
            onChange={(e) => handleInputChange("geoLocation", e.target.value)}
            error={errors.geoLocation}
            placeholder="Paste Google Maps link, coordinates, or <iframe> embed code"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Latitude Override"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) =>
              handleInputChange(
                "latitude",
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            error={errors.latitude}
            placeholder="e.g. 9.012345"
          />

          <Input
            label="Longitude Override"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) =>
              handleInputChange(
                "longitude",
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            error={errors.longitude}
            placeholder="e.g. 38.765432"
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
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
                className={`w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.logo ? "border-red-500" : ""}`}
              />
              {restaurantId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogoPicker(true)}
                >
                  Choose from Restaurant Images
                </Button>
              )}
              {errors.logo && (
                <p className="text-xs text-red-600 mt-1">{errors.logo}</p>
              )}
            </div>
          </div>

          {/* Menu Image Gallery (Multi-Page Support) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-1">
                <label className="block text-sm font-black text-gray-900 uppercase tracking-tight">
                  Restaurant Menu & Cover Gallery
                </label>
                <p className="text-[10px] text-gray-400 font-medium italic">
                  Select a primary cover or manage multiple menu pages.
                </p>
              </div>
              {restaurantId && libraryImages.some(img => img.sourceType === "menu") && (
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                  {libraryImages.filter(img => img.sourceType === "menu").length} Pages Registered
                </span>
              )}
            </div>

            <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-200 shadow-inner space-y-6">
              {/* Grid of All Menu Pages */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* 1. The Active Cover (if it exists) */}
                <div className="relative aspect-[3/4] sm:aspect-square rounded-[1.5rem] overflow-hidden bg-white border-2 border-blue-500 shadow-xl group">
                  {menuImagePreview ? (
                    <>
                      <img
                        src={menuImagePreview}
                        alt="Active menu cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg z-10">
                        Primary Cover
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveMenuImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                      <span className="text-[10px] font-black uppercase tracking-widest">No Active Cover</span>
                    </div>
                  )}
                </div>

                {/* 2. Alternative Pages from Library */}
                {libraryImages
                  .filter(img => img.sourceType === "menu" && img.imageId !== selectedMenuImageId)
                  .map((image) => (
                    <button
                      key={image.imageId}
                      type="button"
                      onClick={() => {
                        setSelectedMenuImageId(image.imageId);
                        setMenuImagePreview(image.imageUrl);
                        setMenuImageFile(null);
                      }}
                      className="relative aspect-[3/4] sm:aspect-square rounded-[1.5rem] overflow-hidden bg-white border border-gray-200 hover:border-blue-400 transition-all hover:shadow-xl group"
                    >
                      <img
                        src={image.imageUrl}
                        alt="Menu page"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <span className="bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          Set as Primary
                        </span>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[8px] font-mono text-white px-2 py-1 rounded-lg border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                        ID: {image.imageId.slice(-6)}
                      </div>
                    </button>
                  ))}

                {/* 3. Upload New Placeholder */}
                <div className="relative aspect-[3/4] sm:aspect-square">
                  <input
                    type="file"
                    id="menu-upload-new"
                    accept="image/*"
                    onChange={handleMenuImageChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="menu-upload-new"
                    className="flex flex-col items-center justify-center gap-3 w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-[1.5rem] hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600">Add Page</span>
                  </label>
                </div>
              </div>

              {/* Browse/All Library Button */}
              {restaurantId && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto rounded-2xl text-[10px] font-black uppercase tracking-widest h-auto py-3 px-8 border-gray-200 hover:bg-white hover:shadow-md transition-all flex items-center gap-2"
                    onClick={() => setShowMenuImagePicker(true)}
                  >
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    Browse Entire Restaurant Library
                  </Button>
                </div>
              )}

              {errors.menuImage && (
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-xl text-center">
                  {errors.menuImage}
                </p>
              )}
            </div>
          </div>

          {/* New: Meal Images Gallery from Library */}
          {restaurantId && (
            <div className="space-y-3 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-black text-gray-900 uppercase tracking-tight">
                    Meal Photos from Library
                  </label>
                  {loadingLibrary && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                </div>
                {libraryImages.filter(img => img.sourceType === "meal").length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowMenuImagePicker(true)}
                    className="group flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-all bg-blue-50 px-3 py-1.5 rounded-full"
                  >
                    View Library ({libraryImages.filter(img => img.sourceType === "meal").length})
                    <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
              
              {!loadingLibrary && libraryImages.filter(img => img.sourceType === "meal").length === 0 ? (
                <div className="py-6 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    No library images found for this restaurant.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {libraryImages.slice(0, 6).map((image) => (
                    <div 
                      key={image.imageId}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.sourceMealName}
                        title={`${image.sourceMealName} (ID: ${image.imageId})`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-[8px] font-mono text-white px-1.5 py-0.5 rounded-lg border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        {image.imageId.slice(-6)}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMenuImageId(image.imageId);
                            setMenuImagePreview(image.imageUrl);
                            setMenuImageFile(null);
                          }}
                          className="w-full py-1.5 bg-white text-[8px] font-black uppercase tracking-tighter rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ImageIcon className="w-2.5 h-2.5 text-blue-600" />
                          Set Cover
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {libraryImages.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setShowMenuImagePicker(true)}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-gray-400 hover:text-blue-500 group bg-gray-50/50"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">+{libraryImages.length - 6} more</span>
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex items-start gap-2 pt-1">
                <Info className="w-3 h-3 text-gray-400 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  These photos are already used in your meals. Selecting one will update the main restaurant cover image instantly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Features (always shown, save button hidden -- unified save) */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Restaurant Features
          </label>
          <RestaurantFeatures
            restaurantId={restaurantId || "temp"}
            selectedFeatures={selectedFeatures}
            onFeaturesChange={setSelectedFeatures}
            disabled={loading}
            showSaveButton={false}
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button type="submit" loading={loading} disabled={loading} size="lg">
            {mode === "create" ? "Add Restaurant" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
