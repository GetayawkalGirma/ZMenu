"use client";

import { MapPin, Utensils, CheckCircle2, ChevronLeft, Layout, Store, Pizza, Coffee, Info, Globe, Loader2, LayoutGrid } from "lucide-react";
import type { DraftRestaurant } from "../AddRestaurantClient";

interface PreviewTabProps {
  draft: DraftRestaurant;
  handleSubmit: () => Promise<void>;
  submitting: boolean;
  canSubmit: boolean;
  setTab: (tab: "info" | "meals" | "preview") => void;
}

export default function PreviewTab({
  draft,
  handleSubmit,
  submitting,
  canSubmit,
  setTab
}: PreviewTabProps) {
  const foodMeals = draft.meals.filter(m => m.foodCategoryType !== "DRINK" && m.isSelected);
  const drinkMeals = draft.meals.filter(m => m.foodCategoryType === "DRINK" && m.isSelected);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Notification */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-none">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Everything looks great!</p>
          <p className="text-[10px] text-emerald-600 font-medium italic">Review your restaurant profile below.</p>
        </div>
      </div>

      {/* Mock Phone Preview Wrapper */}
      <div className="bg-white rounded-[3rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden relative max-w-sm mx-auto aspect-[9/19.5]">
        <div className="h-full overflow-y-auto bg-gray-50 scrollbar-hide">
          {/* Mock Status Bar */}
          <div className="h-6 bg-black flex items-center justify-between px-6 sticky top-0 z-50">
             <span className="text-[10px] text-white font-bold">9:41</span>
             <div className="flex gap-1">
               <div className="w-3 h-3 rounded-full border border-white/20" />
               <div className="w-3 h-3 rounded-full border border-white/20" />
             </div>
          </div>

          {/* Restaurant Hero (Actual Site Style) */}
          <div className="relative h-56 bg-gray-900 overflow-hidden">
            {draft.logoPreview ? (
              <img src={draft.logoPreview} alt="" className="w-full h-full object-cover opacity-70 scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <Store className="w-16 h-16 text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/40 to-black/20" />
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-flex px-2 py-0.5 bg-blue-600 text-white text-[6px] font-black rounded-full uppercase tracking-[0.2em] mb-2 shadow-lg">
                Community Seeded
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">{draft.name || "Restaurant Name"}</h2>
              <div className="flex items-center text-gray-500 gap-1.5 mt-2">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-bold truncate uppercase tracking-tight">{draft.location || "Addis Ababa"}</span>
              </div>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-100">
             <div className="flex items-center text-gray-400 font-bold uppercase tracking-tight text-[8px]">
                <Utensils className="w-3 h-3 mr-1 text-blue-600" />
                {draft.meals.length} Meals
             </div>
             <div className="flex items-center text-gray-400 font-bold uppercase tracking-tight text-[8px]">
                <Globe className="w-3 h-3 mr-1 text-blue-600" />
                Open Now
             </div>
          </div>

          {/* Menu Section (Actual Site Style) */}
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
               <h3 className="text-xs font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  Menu
               </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {draft.meals.filter(m => m.isSelected).slice(0, 4).map((meal, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50 flex flex-col group">
                   <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                     {meal.imagePreview ? (
                       <img src={meal.imagePreview} alt="" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center">
                         <Utensils className="w-4 h-4 text-gray-200" />
                       </div>
                     )}
                     <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/90 backdrop-blur-md rounded-lg shadow-sm">
                        <p className="text-[7px] font-black text-gray-900">{meal.price} ETB</p>
                     </div>
                   </div>
                   <div className="p-2 space-y-0.5">
                     <p className="text-[9px] font-black text-gray-900 uppercase truncate leading-tight">{meal.name}</p>
                     <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">{meal.foodCategoryType}</p>
                   </div>
                </div>
              ))}
              {draft.meals.filter(m => m.isSelected).length === 0 && (
                <div className="col-span-2 py-8 text-center bg-white rounded-2xl border border-dashed border-gray-100">
                   <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">No meals added yet</p>
                </div>
              )}
            </div>

            {draft.meals.length > 4 && (
               <p className="text-[8px] text-center text-blue-600 font-black uppercase tracking-widest">
                  + {draft.meals.length - 4} more items
               </p>
            )}

            {/* Aesthetic Identity Card (Actual Site Style) */}
            <div className="bg-gray-900 rounded-2xl p-4 text-white relative overflow-hidden mt-8">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-[30px] -mr-12 -mt-12" />
               <div className="relative z-10 space-y-4">
                  <div>
                    <span className="text-[6px] font-black text-blue-400 uppercase tracking-widest">Venue Info</span>
                    <h4 className="text-xs font-black tracking-tighter uppercase leading-none mt-0.5">Quick Facts</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Rating</span>
                      <span className="text-[9px] font-black text-white">⭐ 4.8/5</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Noise</span>
                      <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest leading-none">Quiet Spot</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="space-y-4">
        <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 text-center space-y-2">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm mb-2">
             <Globe className="w-6 h-6 text-indigo-500" />
           </div>
           <h4 className="text-xs font-black text-gray-900 uppercase">Ready to go live?</h4>
           <p className="text-[10px] text-gray-500 font-medium max-w-[200px] mx-auto">Once you submit, our team will review the menu and publish it to the community.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setTab("meals")}
            className="flex-none p-4 bg-white border border-gray-200 text-gray-400 rounded-3xl hover:border-gray-900 hover:text-gray-900 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex-1 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl disabled:opacity-40 flex items-center justify-center gap-3 group"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            Submit Restaurant
          </button>
        </div>
      </div>
    </div>
  );
}
