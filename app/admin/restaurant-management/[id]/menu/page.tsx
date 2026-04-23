import { RestaurantMenuRepository } from "@/repositories/menu-item.repository";
import { RestaurantService } from "@/services/restaurant/restaurant.service";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import Link from "next/link";
import { ChevronLeft, Utensils, Tag, Info, Pizza } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurantRes = await RestaurantService.getRestaurantById(id);
  const meals = await RestaurantMenuRepository.getRestaurantMenuItems(id);

  if (!restaurantRes.success || !restaurantRes.data) {
    return <div>Restaurant not found</div>;
  }

  const restaurant = restaurantRes.data;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
                <Link href={`/admin/restaurant-management/${id}`}>
                    <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-full border-gray-100 hover:bg-gray-50 flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">
                        {restaurant.name} Menu
                    </h1>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium italic">
                        Viewing {meals.length} associated meal variants.
                    </p>
                </div>
            </div>
            <Link href={`/admin/restaurant-management/${id}`}>
                <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-xl border-gray-100">
                    Back to Detail
                </Button>
            </Link>
          </div>

          {/* Meals Grid */}
          {meals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <Utensils className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">No Meals Found</h3>
                <p className="text-gray-400 text-sm mt-1">This restaurant doesn't have any meals assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {meals.map((meal) => (
                <Card key={meal.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl sm:rounded-3xl flex flex-col bg-white">
                  <div className="relative h-28 sm:h-40 w-full bg-gray-50 overflow-hidden">
                    {(meal as any).imageUrl || (meal.menuItem as any)?.imageUrl ? (
                        <img
                            src={(meal as any).imageUrl || (meal.menuItem as any)?.imageUrl}
                            alt={meal.name || meal.menuItem?.name || "Meal"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                            <Pizza className="w-8 h-8 opacity-20" />
                            <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-40">No Image</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2">
                        <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5",
                            meal.isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        )}>
                            {meal.isAvailable ? "Available" : "Sold Out"}
                        </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-3 sm:p-5 pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-lg font-black text-gray-900 uppercase tracking-tight truncate">
                      {meal.name || meal.menuItem?.name || "Unnamed"}
                    </CardTitle>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 border-gray-100">
                            {meal.menuItem?.category?.name || "Uncat"}
                        </Badge>
                        {meal.portionSize && (
                            <Badge variant="outline" className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-blue-400 border-blue-50 bg-blue-50/30">
                                {meal.portionSize}
                            </Badge>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-5 pt-0 sm:pt-0 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-300">Price</span>
                            <span className="text-sm sm:text-xl font-black text-gray-900">{meal.price} ETB</span>
                        </div>
                        
                        {meal.description && (
                            <p className="text-[8px] sm:text-xs text-gray-400 line-clamp-2 italic leading-relaxed">
                                "{meal.description}"
                            </p>
                        )}

                        <div className="flex flex-wrap gap-1">
                            {meal.isPopular && (
                                <span className="text-[7px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">Popular</span>
                            )}
                            {meal.isRecommended && (
                                <span className="text-[7px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">Recommended</span>
                            )}
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
