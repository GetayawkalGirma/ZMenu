import { getMealById, getRestaurantsForMeal } from "../actions";
import {
  Button,
  Badge,
} from "@/components/ui";
import { 
  ArrowLeft, 
  Tag, 
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import MealRestaurantListClient from "./MealRestaurantListClient";

export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const mealId = resolvedParams.id;

  const [mealResult, restaurantResult] = await Promise.all([
    getMealById(mealId),
    getRestaurantsForMeal(mealId)
  ]);

  if (!mealResult.success || !mealResult.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">
            {mealResult.error || "Meal not found"}
          </div>
          <Link href="/admin/meals">
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const meal = mealResult.data;
  const restaurants = (restaurantResult.success && restaurantResult.data) ? restaurantResult.data : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Link href="/admin/meals" className="inline-block mb-4 -ml-2">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Meals
              </Button>
            </Link>
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {meal.name}
                </h1>
                {meal.description && (
                  <p className="mt-2 text-gray-500">{meal.description}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-100"
                  >
                    {meal.category?.name || "Uncategorized"}
                  </Badge>
                  {meal.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 border border-gray-100 font-medium"
                    >
                      <Tag className="w-2.5 h-2.5 mr-1 opacity-60" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-6 pt-6 border-t border-gray-100">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Average Price
                    </h4>
                    <p className="text-xl font-black text-green-600">
                      {meal.avgPrice ? formatPrice(meal.avgPrice) : "N/A"}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-gray-100 hidden sm:block" />
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Price Range
                    </h4>
                    <div className="flex items-baseline gap-1.5 font-bold text-gray-700">
                      <span>
                        {meal.minPrice ? formatPrice(meal.minPrice) : "—"}
                      </span>
                      <span className="text-gray-300 font-normal">to</span>
                      <span>
                        {meal.maxPrice ? formatPrice(meal.maxPrice) : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-100 hidden sm:block" />
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Served At
                    </h4>
                    <p className="font-bold text-gray-700">
                      {meal.priceCount || 0} Restaurants
                    </p>
                  </div>
                </div>
              </div>

              {/* Header Image */}
              <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white shrink-0 -mt-2">
                <img
                  src={
                    (meal as any)?.imageUrl ||
                    "https://placehold.co/600x400?text=No+Photo"
                  }
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Client Interactive List */}
          <MealRestaurantListClient meal={meal} initialRestaurants={restaurants as any} />
        </div>
      </div>
    </div>
  );
}
