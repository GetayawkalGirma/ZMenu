import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Checkbox } from "@/components/ui";
import Link from "next/link";
import {
  Sparkles,
  Utensils,
  Flame,
  ChevronRight,
  Store,
  Leaf,
  Beef,
  ChefHat,
  MapPin,
  Pen,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { submitMealInfoFeedback } from "@/app/(public)/feedback.actions";

export function SuperFoodCard({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  
  const [suggestedPrice, setSuggestedPrice] = useState(item.price?.toString() || "");
  const [suggestedPortion, setSuggestedPortion] = useState(item.portionSize || "");
  const [suggestedPrep, setSuggestedPrep] = useState(item.preparationTime?.toString() || "");

  const imageSrc =
    item.imageUrl ||
    item.menuItem?.imageUrl ||
    "https://placehold.co/600x400?text=Premium+Meal";

  const restaurantName = item.restaurant?.name || "Unknown Venue";
  const categoryName = item.menuItem?.category?.name || "Premium Dish";
  const spicyLevel = item.spicyLevel || item.menuItem?.spicyLevel || 0;

  const handleToggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFields.length === 0) return;

    setIsSubmitting(true);
    const res = await submitMealInfoFeedback({
      restaurantId: item.restaurantId,
      restaurantMenuId: item.id,
      suggestedPrice: selectedFields.includes("price") ? parseFloat(suggestedPrice) : undefined,
      suggestedPortionSize: selectedFields.includes("portion") ? suggestedPortion : undefined,
      suggestedPreparationTime: selectedFields.includes("prep") ? parseInt(suggestedPrep) : undefined,
    });

    setIsSubmitting(false);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
        setSelectedFields([]);
      }, 3000);
    }
  };

  return (
    <div className="group h-full relative">
      <Link
        href={`/restaurants/${item.restaurantId}`}
        className="block h-full"
      >
        <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2.5rem] overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 flex flex-col h-full relative">
          {/* Visual Header - High Density for 2-column mobile */}
          <div className="aspect-square w-full bg-gray-50 flex-shrink-0 relative overflow-hidden">
            <img
              src={imageSrc}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
          </div>

          <div className="p-2 sm:p-8 flex-1 flex flex-col justify-between min-w-0">
            <div className="space-y-2 sm:space-y-4">
              {/* Identity & Venue */}
              <div className="space-y-1 sm:space-y-3">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-[7px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest sm:tracking-[0.2em] whitespace-nowrap">
                      {categoryName}
                    </span>
                    {spicyLevel > 0 && (
                      <div className="flex items-center text-orange-600 text-[7px] sm:text-[10px] font-black uppercase tracking-tight bg-orange-50 px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">
                        <Flame className="w-2 sm:w-3.5 h-2 sm:h-3.5 mr-0.5 sm:mr-1 text-orange-500" />{" "}
                        {spicyLevel}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-[10px] sm:text-2xl font-black text-gray-900 leading-tight tracking-tighter uppercase group-hover:text-indigo-600 transition-colors sm:line-clamp-none line-clamp-2 overflow-hidden">
                  {item.name || item.menuItem?.name || "Unnamed Dish"}
                </h3>

                <div className="inline-flex flex-col px-2 py-1 sm:px-3.5 sm:py-2 bg-zinc-900 text-white rounded-lg sm:rounded-xl shadow-lg group-hover:bg-indigo-600 transition-all duration-500 shrink-0">
                  <span className="text-[6px] sm:text-[8px] font-black opacity-50 uppercase tracking-widest leading-none mb-0.5 sm:mb-1 hidden sm:block">
                    Price
                  </span>
                  <span className="text-[9px] sm:text-base font-black tracking-tighter whitespace-nowrap">
                    {formatPrice(item.price)}
                  </span>
                </div>

                <div className="flex items-center text-gray-400 font-black text-[7px] sm:text-[9px] uppercase tracking-widest bg-gray-50/50 px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-xl border border-gray-100 truncate">
                  <Store className="w-2 sm:w-3 h-2 sm:w-3 mr-1 sm:mr-1.5 text-indigo-400" />
                  {restaurantName}
                </div>
              </div>

              {/* Description Area - Hidden on Mobile */}
              <div className="hidden sm:block space-y-2">
                <p className="text-base text-gray-400 font-medium leading-relaxed italic sm:line-clamp-none line-clamp-2">
                  {item.description ||
                    item.menuItem?.description ||
                    "A taste of excellence from their master chef."}
                </p>
              </div>
            </div>

            {/* Compact Footer */}
            <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100 flex items-center justify-between gap-2 sm:gap-6">
              <div className="flex items-center">
                <span className="text-[8px] sm:text-[11px] font-black text-gray-900 uppercase tracking-tight flex items-center">
                  <ChefHat className="w-2.5 sm:w-4 h-2.5 sm:h-4 mr-1 sm:mr-2 text-indigo-400" />{" "}
                  {item.portionSize || "Single"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Floating Action Button - Suggest Edit */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-8 h-8 sm:w-14 sm:h-14 bg-white text-zinc-900 rounded-full shadow-2xl flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-all duration-300 border border-gray-100 z-10 group/btn"
          >
            <Pen className="w-3.5 h-3.5 sm:w-6 sm:h-6 group-hover/btn:scale-110 transition-transform" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter uppercase text-gray-900">
              Request Update
            </DialogTitle>
          </DialogHeader>

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight">Thank You!</h4>
              <p className="text-gray-500 font-medium italic">
                We will review and update your query. Thanks for helping us improve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Select fields to update
                </p>
                
                {/* Price Field */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="price" 
                      checked={selectedFields.includes("price")} 
                      onCheckedChange={() => handleToggleField("price")}
                      className="border-gray-200 data-[state=checked]:bg-zinc-900"
                    />
                    <Label htmlFor="price" className="text-sm font-black uppercase tracking-tight cursor-pointer">
                      Price (ETB)
                    </Label>
                  </div>
                  {selectedFields.includes("price") && (
                    <Input 
                      type="number"
                      value={suggestedPrice}
                      onChange={(e) => setSuggestedPrice(e.target.value)}
                      placeholder="Enter correct price..."
                      className="rounded-xl border-gray-100 focus:ring-zinc-900"
                    />
                  )}
                </div>

                {/* Portion Field */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="portion" 
                      checked={selectedFields.includes("portion")} 
                      onCheckedChange={() => handleToggleField("portion")}
                      className="border-gray-200 data-[state=checked]:bg-zinc-900"
                    />
                    <Label htmlFor="portion" className="text-sm font-black uppercase tracking-tight cursor-pointer">
                      Portion Size
                    </Label>
                  </div>
                  {selectedFields.includes("portion") && (
                    <select
                      value={suggestedPortion}
                      onChange={(e) => setSuggestedPortion(e.target.value)}
                      className="w-full h-10 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-zinc-900 outline-none"
                    >
                      <option value="">Select Size...</option>
                      <option value="ONE_PERSON">Single Person</option>
                      <option value="TWO_PEOPLE">Two People</option>
                      <option value="THREE_PEOPLE">Three People</option>
                      <option value="FAMILY">Family Size</option>
                    </select>
                  )}
                </div>

                {/* Prep Time Field */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="prep" 
                      checked={selectedFields.includes("prep")} 
                      onCheckedChange={() => handleToggleField("prep")}
                      className="border-gray-200 data-[state=checked]:bg-zinc-900"
                    />
                    <Label htmlFor="prep" className="text-sm font-black uppercase tracking-tight cursor-pointer">
                      Preparation Time (Min)
                    </Label>
                  </div>
                  {selectedFields.includes("prep") && (
                    <div className="relative">
                      <Input 
                        type="number"
                        value={suggestedPrep}
                        onChange={(e) => setSuggestedPrep(e.target.value)}
                        placeholder="Minutes..."
                        className="rounded-xl border-gray-100 focus:ring-zinc-900 pl-10"
                      />
                      <Clock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={selectedFields.length === 0 || isSubmitting}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
