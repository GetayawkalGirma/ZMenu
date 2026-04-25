"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Plus, Trash2, Utensils, Sparkles, CheckCircle2, X, Coffee, Loader2, Wand2, Camera, Upload, ChevronLeft } from "lucide-react";
import type { DraftRestaurant, LocalMeal } from "../AddRestaurantClient";
import { searchGlobalMenuItems } from "../actions";

interface MealsTabProps {
  draft: DraftRestaurant;
  updateDraft: (updates: Partial<DraftRestaurant>) => void;
  handleAIExtract: () => Promise<void>;
  extracting: boolean;
  distractionIndex: number;
  removeMeal: (localId: string) => void;
  handleSubmit: () => Promise<void>;
  canSubmit: boolean;
  submitting: boolean;
  setTab: (tab: "info" | "meals" | "preview") => void;
}

const DISTRACTION_MESSAGES = [
  "Reading the chef's handwriting...",
  "Counting the calories (just kidding)...",
  "Identifying that secret sauce...",
  "This might take some time give it a second...",
  "Translating 'Delicious' into code...",
  "Scanning for the deals...",
  "Plating the digital dishes...",
  "Trying to get the prices from your images",
  "Waking up the AI master chef...",
];

export default function MealsTab({
  draft,
  updateDraft,
  handleAIExtract,
  extracting,
  distractionIndex,
  removeMeal,
  handleSubmit,
  canSubmit,
  submitting,
  setTab
}: MealsTabProps) {
  // Local state for search
  const [mealQuery, setMealQuery] = useState("");
  const [mealResults, setMealResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [mealPrice, setMealPrice] = useState("");
  const [mealType, setMealType] = useState("FOOD");
  const [mealRestName, setMealRestName] = useState("");

  const handleMealSearch = async () => {
    if (!mealQuery.trim()) return;
    setSearching(true);
    const result = await searchGlobalMenuItems(mealQuery.trim());
    setMealResults(result.data || []);
    setSearching(false);
  };

  const handleSelectMeal = (meal: any) => {
    setSelectedMeal(meal);
    setMealPrice("");
    setMealRestName("");
    setShowAddForm(true);
  };

  const handleAddMealLocally = () => {
    if (!selectedMeal || !mealPrice) return;
    const newMeal: LocalMeal = {
      localId: `local_${Date.now()}`,
      menuItemId: selectedMeal.id,
      name: mealRestName.trim() || selectedMeal.name,
      globalName: selectedMeal.name,
      price: parseFloat(mealPrice),
      foodCategoryType: mealType,
      dietaryCategory: "YEFITSIK",
      portionSize: "ONE_PERSON",
      spicyLevel: 1,
      ingredients: [],
      description: selectedMeal.description || "",
      isSelected: true,
    };
    updateDraft({ meals: [...draft.meals, newMeal] });
    setShowAddForm(false);
    setSelectedMeal(null);
    setMealQuery("");
    setMealResults([]);
    setMealRestName("");
  };

  const foodMeals = draft.meals.filter((m) => m.foodCategoryType !== "DRINK");
  const drinkMeals = draft.meals.filter((m) => m.foodCategoryType === "DRINK");

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
          Search for a dish to add
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={mealQuery}
              onChange={(e) => setMealQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleMealSearch()}
              placeholder="Search meals..."
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            onClick={handleMealSearch}
            disabled={searching}
            className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors disabled:opacity-50 flex-none"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find"}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {mealResults.length > 0 && !showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <p className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
            {mealResults.length} results — tap to add
          </p>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {mealResults.map((meal) => {
              return (
                <button
                  key={meal.id}
                  onClick={() => handleSelectMeal(meal)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-blue-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-none overflow-hidden">
                    {meal.imageUrl ? (
                      <img src={meal.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Utensils className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{meal.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{meal.category?.name || "Uncategorized"}</p>
                  </div>
                  <Plus className="w-4 h-4 text-blue-500 flex-none" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Meal Form */}
      {showAddForm && selectedMeal && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Utensils className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{selectedMeal.name}</p>
                <p className="text-[10px] text-gray-400">{selectedMeal.category?.name}</p>
              </div>
            </div>
            <button onClick={() => setShowAddForm(false)} className="p-1 rounded text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Restaurant-Specific Name</label>
            <input
              type="text"
              value={mealRestName}
              onChange={(e) => setMealRestName(e.target.value)}
              placeholder={`e.g. Killer ${selectedMeal.name}`}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Price (ETB) *</label>
              <input
                type="number"
                value={mealPrice}
                onChange={(e) => setMealPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium bg-white"
              >
                <option value="FOOD">Food</option>
                <option value="DRINK">Drink</option>
                <option value="EXTRA">Extra</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleAddMealLocally}
            disabled={!mealPrice}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add to Draft
          </button>
        </div>
      )}

      {/* AI Magic Section */}
      {draft.meals.length === 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-[2.5rem] border border-indigo-100 p-8 text-center shadow-xl">
          {extracting && (
            <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-8 transition-all">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600" />
                <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <p className="text-sm font-black text-gray-900 uppercase tracking-tight animate-bounce">
                {DISTRACTION_MESSAGES[distractionIndex]}
              </p>
            </div>
          )}

          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-lg mb-6">
            <Wand2 className="w-8 h-8 text-indigo-500" />
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">AI Magic Tool</h3>
            <p className="text-xs text-gray-500 font-medium">Extract dishes and prices from your photos automatically.</p>
          </div>

          <button
            onClick={handleAIExtract}
            disabled={extracting}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-2xl ${
              extracting ? "bg-indigo-400 text-white" : draft.menuImageFiles.length === 0 ? "bg-white text-gray-300 border cursor-not-allowed" : "bg-gray-900 text-white hover:bg-black"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Use AI Magic
          </button>
        </div>
      )}

      {/* Meals List */}
      <div className="space-y-4">
        {foodMeals.length > 0 && (
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Utensils className="w-2.5 h-2.5" /> Food ({foodMeals.length})
            </p>
            <div className="space-y-4">
              {foodMeals.map((meal) => (
                <MealEditor
                  key={meal.localId}
                  meal={meal}
                  onUpdate={(updates) => {
                    const newMeals = draft.meals.map((m) => (m.localId === meal.localId ? { ...m, ...updates } : m));
                    updateDraft({ meals: newMeals });
                  }}
                  onRemove={() => removeMeal(meal.localId)}
                />
              ))}
            </div>
          </div>
        )}
        {drinkMeals.length > 0 && (
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Coffee className="w-2.5 h-2.5" /> Drinks ({drinkMeals.length})
            </p>
            <div className="space-y-4">
              {drinkMeals.map((meal) => (
                <MealEditor
                  key={meal.localId}
                  meal={meal}
                  onUpdate={(updates) => {
                    const newMeals = draft.meals.map((m) => (m.localId === meal.localId ? { ...m, ...updates } : m));
                    updateDraft({ meals: newMeals });
                  }}
                  onRemove={() => removeMeal(meal.localId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation button */}
      <button
        onClick={() => setTab("preview")}
        disabled={draft.meals.length === 0}
        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
      >
        Next: Preview Restaurant <Sparkles className="w-4 h-4" />
      </button>
    </div>
  );
}

import { saveFileLocal, compressImage } from "@/lib/local-draft-store";

function MealEditor({ 
  meal, 
  onUpdate, 
  onRemove 
}: { 
  meal: LocalMeal; 
  onUpdate: (updates: Partial<LocalMeal>) => void; 
  onRemove: () => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const result = await searchGlobalMenuItems(query.trim());
    setResults(result.data || []);
    setSearching(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress and save locally
    const compressed = await compressImage(file);
    await saveFileLocal(`meal_${meal.localId}`, compressed);
    const preview = URL.createObjectURL(compressed);
    
    onUpdate({ 
      imageFile: compressed, 
      imagePreview: preview 
    });
  };

  return (
    <div className={`bg-white rounded-3xl border transition-all ${meal.isSelected ? "border-gray-100 shadow-xl" : "border-gray-100 opacity-60 bg-gray-50/50"}`}>
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={() => onUpdate({ isSelected: !meal.isSelected })}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${meal.isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200"}`}
        >
          {meal.isSelected && <CheckCircle2 className="w-4 h-4" />}
        </button>

        <label className="relative w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-none cursor-pointer group">
          {meal.imagePreview ? <img src={meal.imagePreview} alt="" className="w-full h-full object-cover" /> : <Camera className="w-5 h-5 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Upload className="w-4 h-4 text-white" /></div>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </label>

        <div className="flex-1 min-w-0" onClick={() => setIsEditing(!isEditing)}>
          <p className="text-sm font-black text-gray-900 truncate uppercase">{meal.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">{meal.price} ETB</span>
            <span className="text-[10px] font-black text-indigo-500 uppercase truncate">{meal.globalName}</span>
          </div>
        </div>

        <div className="flex gap-1">
          <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-400 hover:text-indigo-600"><Wand2 className="w-4 h-4" /></button>
          <button onClick={onRemove} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {isEditing && (
        <div className="px-4 pb-6 pt-2 border-t border-gray-50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-[9px] font-black text-gray-400 mb-1.5 uppercase">Portion</label>
              <select value={meal.portionSize} onChange={(e) => onUpdate({ portionSize: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs font-bold bg-gray-50"><option value="ONE_PERSON">1 Person</option><option value="TWO_PERSONS">2 People</option></select>
            </div>
            <div><label className="block text-[9px] font-black text-gray-400 mb-1.5 uppercase">Dietary</label>
              <select value={meal.dietaryCategory} onChange={(e) => onUpdate({ dietaryCategory: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-xs font-bold bg-gray-50"><option value="YEFITSIK">Meat</option><option value="YETSOM">Fasting</option></select>
            </div>
          </div>
          <textarea value={meal.description} onChange={(e) => onUpdate({ description: e.target.value })} placeholder="Description..." className="w-full px-3 py-2 rounded-xl border text-xs bg-gray-50 min-h-[60px]" />
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 space-y-6">
            <div className="flex items-center justify-between"><h3 className="text-sm font-black uppercase">Link to Global Menu</h3><button onClick={() => setSearchOpen(false)}><X className="w-5 h-5" /></button></div>
            <div className="flex gap-2"><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="flex-1 px-4 py-3 rounded-2xl border text-sm bg-gray-50" /><button onClick={handleSearch} className="p-3 bg-gray-900 text-white rounded-2xl"><Search className="w-5 h-5" /></button></div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {results.map((r) => (
                <button key={r.id} onClick={() => { onUpdate({ menuItemId: r.id, globalName: r.name }); setSearchOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 text-left">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">{r.imageUrl ? <img src={r.imageUrl} alt="" className="w-full h-full object-cover" /> : <Utensils className="w-5 h-5 text-gray-200" />}</div>
                  <div><p className="text-xs font-black uppercase">{r.name}</p><p className="text-[10px] text-gray-400 uppercase">{r.category?.name}</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
