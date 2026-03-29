"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
} from "@/components/ui";
import {
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
} from "../restaurant-management/feature-actions";
import type { CreateFeatureInput, UpdateFeatureInput } from "@/lib/validations/feature.validation";
import type { Feature } from "@/repositories/feature.repository";

export default function FeaturesManagementPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [newFeature, setNewFeature] = useState<CreateFeatureInput>({ name: "", description: "" });
  const [editFeature, setEditFeature] = useState<UpdateFeatureInput>({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load features on mount
  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setIsLoading(true);
    try {
      const result = await getFeatures();
      if (result.success && result.data) {
        setFeatures(result.data);
      } else {
        setError(result.error || "Failed to load features");
      }
    } catch (error) {
      setError("Failed to load features");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFeature = async () => {
    if (!newFeature.name.trim()) {
      setError("Feature name is required");
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createFeature(newFeature);
      
      if (result.success) {
        setSuccess("Feature created successfully!");
        setNewFeature({ name: "", description: "" });
        setShowCreateDialog(false);
        await loadFeatures(); // Reload features
      } else {
        setError(result.error || "Failed to create feature");
      }
    } catch (error) {
      setError("Failed to create feature");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditFeature = async () => {
    if (!editingFeature || !editFeature.name?.trim()) {
      setError("Feature name is required");
      return;
    }

    setIsEditing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateFeature(editingFeature.id, editFeature);
      
      if (result.success) {
        setSuccess("Feature updated successfully!");
        setEditFeature({ name: "", description: "" });
        setEditingFeature(null);
        setShowEditDialog(false);
        await loadFeatures(); // Reload features
      } else {
        setError(result.error || "Failed to update feature");
      }
    } catch (error) {
      setError("Failed to update feature");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    setIsDeleting(featureId);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteFeature(featureId);
      
      if (result.success) {
        setSuccess("Feature deleted successfully!");
        await loadFeatures(); // Reload features
      } else {
        setError(result.error || "Failed to delete feature");
      }
    } catch (error) {
      setError("Failed to delete feature");
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditDialog = (feature: Feature) => {
    setEditingFeature(feature);
    setEditFeature({
      name: feature.name,
      description: feature.description || "",
    });
    setShowEditDialog(true);
  };

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (feature.description && feature.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Features Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage restaurant features available for selection
              </p>
            </div>
            <div className="space-x-2">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>+ Create Feature</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Feature</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feature Name
                      </label>
                      <Input
                        value={newFeature.name}
                        onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Outdoor Seating"
                        disabled={isCreating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <Input
                        value={newFeature.description || ""}
                        onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
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
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 text-sm text-green-600 bg-green-50 rounded-md">
              {success}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Features Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading features...</p>
              </div>
            ) : filteredFeatures.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-400 text-5xl mb-4">🏷️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No features found" : "No features available"}
                </h3>
                <p className="text-sm text-gray-600">
                  {searchQuery ? "Try a different search term" : "Create your first feature to get started"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-4"
                  >
                    Create First Feature
                  </Button>
                )}
              </div>
            ) : (
              filteredFeatures.map((feature) => (
                <Card key={feature.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                      <Badge variant="secondary">
                        {feature.createdAt.toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {feature.description && (
                      <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(feature)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteFeature(feature.id)}
                        disabled={isDeleting === feature.id}
                      >
                        {isDeleting === feature.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Feature</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Name
                  </label>
                  <Input
                    value={editFeature.name || ""}
                    onChange={(e) => setEditFeature(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Outdoor Seating"
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <Input
                    value={editFeature.description || ""}
                    onChange={(e) => setEditFeature(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the feature"
                    disabled={isEditing}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                    disabled={isEditing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditFeature}
                    disabled={isEditing || !editFeature.name?.trim()}
                  >
                    {isEditing ? "Updating..." : "Update Feature"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
