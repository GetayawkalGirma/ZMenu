"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Label,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import {
  getFeatures,
  searchFeatures,
  createFeature,
  getRestaurantFeatures,
  assignFeatures,
} from "@/app/admin/restaurant-management/feature-actions";
import type { CreateFeatureInput } from "@/lib/validations/feature.validation";
import type { Feature } from "@/repositories/feature.repository";

interface RestaurantFeaturesProps {
  restaurantId: string;
  selectedFeatures?: string[];
  onFeaturesChange?: (featureIds: string[]) => void;
  disabled?: boolean;
}

export function RestaurantFeatures({
  restaurantId,
  selectedFeatures = [],
  onFeaturesChange,
  disabled = false,
}: RestaurantFeaturesProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFeature, setNewFeature] = useState<CreateFeatureInput>({
    name: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const featuresPerPage = 4;

  // Get selected feature details
  const selectedFeatureDetails = features.filter((feature) =>
    selectedFeatures.includes(feature.id),
  );

  // Load all features on mount
  useEffect(() => {
    loadFeatures();
  }, []);

  // Load restaurant's current features
  useEffect(() => {
    if (restaurantId) {
      loadRestaurantFeatures();
    }
  }, [restaurantId]);

  // Search features when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchFeaturesList(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    } else {
      setSearchResults([]);
      setCurrentPage(1); // Reset to first page when clearing search
    }
  }, [searchQuery]);

  const loadFeatures = async () => {
    setIsLoading(true);
    try {
      const result = await getFeatures();
      if (result.success && result.data) {
        setFeatures(result.data);
      }
    } catch (error) {
      setError("Failed to load features");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRestaurantFeatures = async () => {
    try {
      const result = await getRestaurantFeatures(restaurantId);
      if (result.success && result.data) {
        const featureIds = result.data.map((f) => f.id);
        if (onFeaturesChange) {
          onFeaturesChange(featureIds);
        }
      }
    } catch (error) {
      console.error("Failed to load restaurant features:", error);
    }
  };

  const searchFeaturesList = async (query: string) => {
    try {
      const result = await searchFeatures(query);
      if (result.success && result.data) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error("Failed to search features:", error);
    }
  };

  const handleCreateFeature = async () => {
    if (!newFeature.name.trim()) {
      setError("Feature name is required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await createFeature(newFeature);

      if (result.success) {
        // Add the new feature to the list
        if (result.data) {
          setFeatures((prev) => [...prev, result.data!]);
        }

        // Reset form
        setNewFeature({ name: "", description: "" });
        setShowCreateDialog(false);

        // Auto-select the new feature
        if (result.data && onFeaturesChange) {
          onFeaturesChange([...selectedFeatures, result.data.id]);
        }
      } else {
        setError(result.error || "Failed to create feature");
      }
    } catch (error) {
      setError("Failed to create feature");
    } finally {
      setIsCreating(false);
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    if (disabled) return;

    const newSelection = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter((id) => id !== featureId)
      : [...selectedFeatures, featureId];

    if (onFeaturesChange) {
      onFeaturesChange(newSelection);
    }
  };

  const handleSaveFeatures = async () => {
    if (!restaurantId) return;

    try {
      const result = await assignFeatures(restaurantId, selectedFeatures);

      if (!result.success) {
        setError(result.error || "Failed to save features");
      }
    } catch (error) {
      setError("Failed to save features");
    }
  };

  const displayFeatures = searchQuery.trim() ? searchResults : [];

  // Pagination logic
  const totalPages = Math.ceil(displayFeatures.length / featuresPerPage);
  const startIndex = (currentPage - 1) * featuresPerPage;
  const endIndex = startIndex + featuresPerPage;
  const currentFeatures = displayFeatures.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-20"
          disabled={disabled}
        />
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-1 top-1 h-7"
              disabled={disabled}
            >
              + Create
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Feature</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feature-name">Feature Name</Label>
                <Input
                  id="feature-name"
                  value={newFeature.name}
                  onChange={(e) =>
                    setNewFeature((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Outdoor Seating"
                  disabled={isCreating}
                />
              </div>
              <div>
                <Label htmlFor="feature-description">
                  Description (Optional)
                </Label>
                <Input
                  id="feature-description"
                  value={newFeature.description || ""}
                  onChange={(e) =>
                    setNewFeature((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the feature"
                  disabled={isCreating}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFeature}
                  disabled={isCreating || !newFeature.name.trim()}
                >
                  {isCreating ? "Creating..." : "Create Feature"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Features Section */}
      {selectedFeatureDetails.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Features ({selectedFeatureDetails.length})
            </h4>
          </div>
          <div className="space-y-2">
            {selectedFeatureDetails.map((feature) => (
              <div
                key={`selected-${feature.id}`}
                className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`selected-feature-${feature.id}`}
                    checked={true}
                    onCheckedChange={() => handleFeatureToggle(feature.id)}
                    disabled={disabled}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`selected-feature-${feature.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {feature.name}
                    </Label>
                    {feature.description && (
                      <p className="text-xs text-gray-500">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeatureToggle(feature.id)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-gray-900">
            Search & Add Features
          </h4>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {!searchQuery.trim() ? (
            <div className="text-center py-4 text-gray-500">
              <div className="text-gray-400 text-2xl mb-2">🔍</div>
              <p className="text-sm">Type to search features...</p>
            </div>
          ) : currentFeatures.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No features found</p>
            </div>
          ) : (
            <>
              {currentFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
                >
                  <Checkbox
                    id={`feature-${feature.id}`}
                    checked={selectedFeatures.includes(feature.id)}
                    onCheckedChange={() => handleFeatureToggle(feature.id)}
                    disabled={disabled}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`feature-${feature.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {feature.name}
                    </Label>
                    {feature.description && (
                      <p className="text-xs text-gray-500">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-2 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Selected Features Summary */}
      {selectedFeatures.length > 0 && (
        <div className="text-sm text-gray-600">
          {selectedFeatures.length} feature
          {selectedFeatures.length !== 1 ? "s" : ""} selected
        </div>
      )}

      {/* Save Button */}
      {onFeaturesChange && !disabled && (
        <Button
          onClick={handleSaveFeatures}
          className="w-full"
          disabled={isLoading}
        >
          Save Features
        </Button>
      )}
    </div>
  );
}
