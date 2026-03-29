import { MenuItemService } from "@/services/menu-item/menu-item.service";
import SearchContent from "./SearchContent";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  
  // Initial SSR fetch
  const initialData = q 
    ? await MenuItemService.searchMenuItems(q)
    : await MenuItemService.getAllMenuItems();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="mb-20 space-y-4 text-center sm:text-left">
           <h1 className="text-5xl sm:text-8xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              Market <br />
              <span className="text-blue-600">Discovery.</span>
           </h1>
           <p className="text-gray-400 font-medium text-lg sm:text-xl max-w-xl leading-relaxed">
              Scan through all culinary concepts across the city. Dynamic pricing and venue mapping integrated.
           </p>
        </div>

        <SearchContent initialData={initialData} initialQuery={q || ""} />
      </div>
    </div>
  );
}
