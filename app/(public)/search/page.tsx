import { MenuItemFilters } from "@/components/search/MenuItemFilters";
import { MenuItemService } from "@/services/menu-item/menu-item.service";
import { SearchMealInfinite } from "./SearchMealInfinite";
import { Button } from "@/components/ui";
import { Filter } from "lucide-react";
import { MainSearchBar } from "@/components/search/MainSearchBar";

export const revalidate = 0;
const PAGE_SIZE = 9;

function normalizeParam(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = normalizeParam(params.search) || normalizeParam(params.q);
  const categoriesParam = normalizeParam(params.categories);
  const categories = categoriesParam
    ? categoriesParam.split(",").filter(Boolean)
    : [];
  const typesParam = normalizeParam(params.types);
  const types = typesParam ? typesParam.split(",").filter(Boolean) : [];
  const nearMe = normalizeParam(params.nearMe) === "true";
  const userLat = params.lat
    ? parseFloat(normalizeParam(params.lat) || "")
    : undefined;
  const userLng = params.lng
    ? parseFloat(normalizeParam(params.lng) || "")
    : undefined;

  const mealResult = await MenuItemService.getMenuItemsPaginated({
    page: 1,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    categoryNames: categories.length > 0 ? categories : undefined,
    foodCategoryTypes: types.length > 0 ? types : undefined,
    nearMe,
    userLat,
    userLng,
  });

  const meals = mealResult.items;
  const totalMeals = mealResult.total;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <section className="relative bg-white pt-10 pb-20 sm:pt-20 sm:pb-32 overflow-hidden border-b border-gray-100 px-4 text-center sm:text-left">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="max-w-3xl space-y-4 sm:space-y-6 mx-auto sm:mx-0 text-center sm:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                <span>Discover Meals</span>
              </div>
              <h1 className="text-3xl sm:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
                Search meals <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 uppercase">
                  from every kitchen
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-gray-400 font-medium max-w-xl leading-relaxed italic mx-auto sm:mx-0">
                What do you feel like eating today?
              </p>
            </div>

            <div className="w-full md:w-auto pb-4">
               <div className="flex items-center gap-2">
                  <div className="bg-white p-2 flex-1 rounded-[2rem] shadow-2xl shadow-indigo-100 border border-indigo-50 flex items-center group focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                     <MainSearchBar 
                       placeholder="Search dishes..." 
                       className="w-full md:w-80 lg:w-96"
                     />
                     <Button size="lg" className="hidden sm:inline-flex bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200">
                       Find
                     </Button>
                  </div>
                  
                  {/* Mobile Filter Trigger */}
                  <div className="lg:hidden">
                    <MenuItemFilters
                      trigger={
                        <Button
                          variant="outline"
                          className="h-12 w-12 sm:h-14 sm:w-14 p-0 rounded-2xl border-gray-100 bg-white shadow-xl shadow-indigo-50 flex items-center justify-center hover:bg-gray-50 transition-all"
                        >
                          <Filter className="w-5 h-5 text-indigo-600" />
                        </Button>
                      }
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 pb-20 sm:pb-32">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-12">
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <MenuItemFilters />
            </div>
          </div>

          <div className="flex-1 space-y-6 sm:space-y-10">
            <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Meal Results
                </div>
              </div>
              <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase text-gray-400">
                <span className="hidden xs:inline">Sorted by</span>{" "}
                <span className="text-indigo-600">Relevance</span>
              </div>
            </div>

            <SearchMealInfinite
              initialItems={meals}
              initialTotal={totalMeals}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
