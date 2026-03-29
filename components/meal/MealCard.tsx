"use client";

import { MealWithId, PortionSize } from "@/lib/types/meal";
import { formatPrice } from "@/lib/utils";
import { Button, Badge, Card } from "@/components/ui";

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
    <Card className="overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 group">
      <div className="flex flex-col md:flex-row">
        {/* Meal Image */}
        <div className="md:w-32 h-32 md:h-auto bg-gray-50 flex-shrink-0 relative overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={meal.restName || meal.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400?text=No+Item+Image";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 opacity-40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-[8px] font-bold uppercase tracking-tighter">
                No Photo
              </span>
            </div>
          )}
        </div>

        {/* Meal Details */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {meal.restName || meal.name}
              </h3>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-lg font-black text-green-600">
                  {formatPrice(meal.price || 0)}
                </span>
                {meal.categoryId && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 py-0 text-[10px]"
                  >
                    {meal.categoryId}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-gray-500 border-gray-200 py-0 text-[10px]"
                >
                  {getPortionLabel(meal.portionSize || PortionSize.ONE_PERSON)}
                </Badge>
              </div>
            </div>

            {/* Inline Actions */}
            {showActions && (
              <div className="flex space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => onEdit(meal)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </Button>
                )}
                {onDelete && meal.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(meal.id!)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 text-sm text-gray-600 line-clamp-1 italic">
            {meal.restDescription ||
              meal.description ||
              "No description provided."}
          </div>

          {/* Metadata Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2">
            <div className="flex flex-wrap gap-1">
              {meal.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-gray-400 font-medium"
                >
                  #{tag}
                </span>
              ))}
              {meal.tags && meal.tags.length > 3 && (
                <span className="text-[10px] text-gray-300">
                  +{meal.tags.length - 3}
                </span>
              )}
            </div>
            {meal.calories && meal.calories > 0 && (
              <span className="text-[10px] font-bold text-orange-500 flex items-center">
                <span className="mr-1">🔥</span> {meal.calories} kcal
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
