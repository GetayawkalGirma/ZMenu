"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { getRestaurantFeatures } from "@/app/admin/restaurant-management/feature-actions";
import type { Feature } from "@/repositories/feature.repository";

interface RestaurantFeaturesViewProps {
  restaurantId: string;
}

export function RestaurantFeaturesView({
  restaurantId,
}: RestaurantFeaturesViewProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurantFeatures();
  }, [restaurantId]);

  const loadRestaurantFeatures = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getRestaurantFeatures(restaurantId);

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Loading features...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Restaurant Features
          {features.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({features.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {features.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No features added
            </h3>
            <p className="text-sm text-gray-600">
              This restaurant doesn't have any special features yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">
                      {feature.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {feature.name}
                  </h4>
                  {feature.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {feature.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
