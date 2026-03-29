"use client";

import { MealWithId, PortionSize } from "@/lib/types/meal";
import { formatPrice } from "@/lib/utils";
import { Button, Badge } from "@/components/ui";

interface MealCardProps {
  meal: MealWithId;
  onEdit?: (meal: MealWithId) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function MealCard({
  meal,
  onEdit,
  onDelete,
  showActions = true,
}: MealCardProps) {

  const getPortionLabel = (portion: PortionSize) => {
    switch (portion) {
      case PortionSize.ONE_PERSON:
        return "One Person";
      case PortionSize.TWO_PEOPLE:
        return "Two People";
      case PortionSize.THREE_PEOPLE:
        return "Three People";
      case PortionSize.FAMILY:
        return "Family";
      default:
        return portion;
    }
  };

  const imageSrc =
    meal.imageUrl ||
    (meal.image instanceof File ? URL.createObjectURL(meal.image) : null);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex space-x-4">
        {/* Meal Image */}
        {imageSrc && (
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={imageSrc}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Meal Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {meal.name}
              </h3>

              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span className="font-medium text-lg text-green-600">
                  {formatPrice(meal.price || 0)}
                </span>

                {meal.categoryId && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {meal.categoryId}
                  </span>
                )}

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {getPortionLabel(meal.portionSize || PortionSize.ONE_PERSON)}
                </span>
              </div>

              {meal.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {meal.description}
                </p>
              )}

              {/* Enrichment */}
              <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
                {/* Tags */}
                {meal.tags && meal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {meal.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1.5 h-auto">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {meal.calories && meal.calories > 0 && (
                  <span className="text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    🔥 {meal.calories} kcal
                  </span>
                )}
              </div>

              {/* List of Ingredients */}
              {meal.ingredients && meal.ingredients.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Ingredients: <span className="normal-case font-normal text-gray-700">{meal.ingredients.join(", ")}</span>
                  </div>
                </div>
              )}

              {/* Availability Status */}
              <div className="mt-3 flex items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    meal.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {meal.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex flex-col space-y-2 ml-4">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(meal)}
                  >
                    Edit
                  </Button>
                )}

                {onDelete && meal.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(meal.id!)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
