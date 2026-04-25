"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchGlobalMenuItems, bulkSubmitRestaurant } from "./actions";
import { extractMealsFromImage } from "./ai-actions";
import {
  ChevronLeft,
  Upload,
  Store,
  ImageIcon,
  Search,
  Plus,
  Trash2,
  Utensils,
  Sparkles,
  CheckCircle2,
  X,
  Coffee,
  Loader2,
  Camera,
  Wand2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────
interface LocalMeal {
  localId: string;
  menuItemId: string;
  name: string; // Restaurant-specific name
  globalName?: string; // Generic name from Global Menu
  price: number;
  foodCategoryType: string;
  dietaryCategory: string;
  portionSize: string;
  spicyLevel: number;
  description: string;
  ingredients: string[];
  imageFile?: File;
  imagePreview?: string;
  isSelected: boolean;
}

interface DraftRestaurant {
  name: string;
  location: string;
  logoFile?: File;
  logoPreview?: string;
  menuImageFiles: File[];
  menuImagePreviews: string[];
  meals: LocalMeal[];
}

const STORAGE_KEY = "zmenu_draft_restaurant";

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

function loadDraft(): DraftRestaurant {
  if (typeof window === "undefined")
    return {
      name: "",
      location: "",
      menuImageFiles: [],
      menuImagePreviews: [],
      meals: [],
    };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        logoFile: undefined,
        menuImageFiles: [],
        meals: (parsed.meals || []).map((m: any) => ({
          ...m,
          imageFile: undefined,
        })),
      };
    }
  } catch {}
  return {
    name: "",
    location: "",
    menuImageFiles: [],
    menuImagePreviews: [],
    meals: [],
  };
}

function saveDraft(draft: DraftRestaurant) {
  try {
    const serializable = {
      name: draft.name,
      location: draft.location,
      logoPreview: draft.logoPreview,
      menuImagePreviews: draft.menuImagePreviews,
      meals: draft.meals.map((m) => ({
        ...m,
        imageFile: undefined,
        imagePreview: m.imagePreview,
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {}
}

type Tab = "info" | "meals";

export default function AddRestaurantClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("info");
  const [draft, setDraft] = useState<DraftRestaurant>({
    name: "",
    location: "",
    menuImageFiles: [],
    menuImagePreviews: [],
    meals: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load draft on mount to avoid hydration mismatch
  useEffect(() => {
    const saved = loadDraft();
    setDraft(saved);
    setIsLoaded(true);
  }, []);

  // Meal search
  const [mealQuery, setMealQuery] = useState("");
  const [mealResults, setMealResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [mealPrice, setMealPrice] = useState("");
  const [mealType, setMealType] = useState("FOOD");
  const [mealRestName, setMealRestName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [distractionIndex, setDistractionIndex] = useState(0);

  // Cycle distraction messages
  useEffect(() => {
    if (!extracting) return;
    const interval = setInterval(() => {
      setDistractionIndex((prev) => (prev + 1) % DISTRACTION_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [extracting]);

  // Save to localStorage on every change
  useEffect(() => {
    if (isLoaded) {
      saveDraft(draft);
    }
  }, [draft, isLoaded]);

  const updateDraft = useCallback((updates: Partial<DraftRestaurant>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  // ── Image handlers ──────────────────────────────────────────
  const handleFileSelect = (
    field: "logoFile" | "menuImageFiles",
    files: FileList | null,
  ) => {
    if (!files || files.length === 0) return;

    if (field === "logoFile") {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      updateDraft({ logoFile: file, logoPreview: preview });
    } else {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      updateDraft({
        menuImageFiles: [...draft.menuImageFiles, ...newFiles],
        menuImagePreviews: [...draft.menuImagePreviews, ...newPreviews],
      });
    }
  };

  const removeMenuImage = (index: number) => {
    const newFiles = [...draft.menuImageFiles];
    const newPreviews = [...draft.menuImagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    updateDraft({ menuImageFiles: newFiles, menuImagePreviews: newPreviews });
  };

  // ── Meal search ─────────────────────────────────────────────
  const handleMealSearch = useCallback(async () => {
    if (!mealQuery.trim()) return;
    setSearching(true);
    const result = await searchGlobalMenuItems(mealQuery.trim());
    setMealResults(result.data || []);
    setSearching(false);
  }, [mealQuery]);

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

  // ── AI extraction ───────────────────────────────────────────
  const OTHER_FOOD_ID = "cmo5f21hk00046pr98jxr6qgc";
  const OTHER_DRINK_ID = "cmo5ezp5z00026pr9cnxjxogp";

  const handleAIExtract = async () => {
    if (draft.menuImageFiles.length === 0) {
      alert(
        "Please re-select your menu image(s) in the Info tab. For security, browsers don't let us save the actual image files in your draft after a refresh.",
      );
      setTab("info");
      return;
    }

    setExtracting(true);
    let allNewMeals: LocalMeal[] = [];

    try {
      for (const [idx, file] of draft.menuImageFiles.entries()) {
        const fd = new FormData();
        fd.append("menuImage", file);

        const result = await extractMealsFromImage(fd);

        if (result.success && result.data) {
          const aiMeals: LocalMeal[] = result.data.map((m, i) => ({
            localId: `ai_${Date.now()}_${idx}_${i}`,
            menuItemId: m.type === "DRINK" ? OTHER_DRINK_ID : OTHER_FOOD_ID,
            name: m.name,
            globalName: m.type === "DRINK" ? "Other Drink" : "Other Food",
            price: m.price || 0,
            foodCategoryType: m.type,
            dietaryCategory: m.dietaryCategory || "YEFITSIK",
            portionSize: "ONE_PERSON",
            spicyLevel: 1,
            ingredients: [],
            description: "",
            isSelected: true,
          }));
          allNewMeals = [...allNewMeals, ...aiMeals];
        }
      }

      if (allNewMeals.length > 0) {
        updateDraft({ meals: [...draft.meals, ...allNewMeals] });
      } else {
        alert("AI could not find any dishes. Try clearer photos.");
      }
    } catch (err: any) {
      alert("AI extraction failed. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  const removeMeal = (localId: string) => {
    updateDraft({ meals: draft.meals.filter((m) => m.localId !== localId) });
  };

  // ── Final submission ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!draft.name.trim() || !draft.location.trim()) {
      alert("Please fill in restaurant name and location first.");
      setTab("info");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", draft.name.trim());
      fd.append("location", draft.location.trim());
      if (draft.logoFile) fd.append("logo", draft.logoFile);
      
      // We send the first menu image as the primary one for the restaurant
      if (draft.menuImageFiles.length > 0) {
        fd.append("menuImage", draft.menuImageFiles[0]);
      }

      // Add source information
      const sourceData = {
        source: "PUBLIC_USER",
        metadata: {
          userAgent: navigator.userAgent,
          platform: (navigator as any).platform,
          submittedAt: new Date().toISOString(),
          totalImagesUploaded: draft.menuImageFiles.length
        }
      };
      fd.append("sourceInfo", JSON.stringify(sourceData));

      const selectedMeals = draft.meals.filter((m) => m.isSelected);
      const mealsData = selectedMeals.map((m) => ({
        menuItemId: m.menuItemId,
        name: m.name,
        price: m.price,
        foodCategoryType: m.foodCategoryType,
        dietaryCategory: m.dietaryCategory,
        portionSize: m.portionSize,
        spicyLevel: m.spicyLevel,
        description: m.description,
        ingredients: m.ingredients,
      }));
      fd.append("meals", JSON.stringify(mealsData));

      selectedMeals.forEach((m) => {
        if (m.imageFile) fd.append(`mealImage_${m.menuItemId}`, m.imageFile);
      });

      const result = await bulkSubmitRestaurant(fd);
      if (result.success) {
        localStorage.removeItem(STORAGE_KEY);
        setSubmitResult(result.data);
        setSubmitted(true);
      } else {
        alert("Failed: " + result.error);
      }
    } catch (err: any) {
      alert("Something went wrong: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Submitted!
          </h2>
          <p className="text-gray-500 text-sm">
            <strong>{submitResult?.restaurantName}</strong> has been submitted
            with <strong>{submitResult?.mealsLinked}</strong> meals. Our team
            will review and publish it soon!
          </p>
          <button
            onClick={() => router.push("/restaurants")}
            className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  const canSubmit = draft.name.trim() && draft.location.trim();
  const foodMeals = draft.meals.filter((m) => m.foodCategoryType !== "DRINK");
  const drinkMeals = draft.meals.filter((m) => m.foodCategoryType === "DRINK");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-14 sm:top-20 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-gray-900 uppercase tracking-tight truncate">
                Add Restaurant
              </h1>
              <p className="text-[10px] text-gray-400 italic">
                Offline Draft — saved locally
              </p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg disabled:opacity-40 hover:bg-black transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span className="hidden xs:inline">Upload</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex max-w-2xl mx-auto">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${tab === "info" ? "text-gray-900 border-gray-900" : "text-gray-400 border-transparent hover:text-gray-600"}`}
          >
            <Store className="w-3.5 h-3.5" /> Info
          </button>
          <button
            onClick={() => setTab("meals")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${tab === "meals" ? "text-gray-900 border-gray-900" : "text-gray-400 border-transparent hover:text-gray-600"}`}
          >
            <Utensils className="w-3.5 h-3.5" /> Meals ({draft.meals.length})
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* ── INFO TAB ────────────────────────────────────────── */}
        {tab === "info" && (
          <div className="space-y-5">
            {/* Restaurant Name */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                placeholder="e.g. Habesha 2000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Location *
              </label>
              <input
                type="text"
                value={draft.location}
                onChange={(e) => updateDraft({ location: e.target.value })}
                placeholder="e.g. Bole, Addis Ababa"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Restaurant Photo
              </label>
              <div className="relative group">
                <label className="block cursor-pointer">
                  <div
                    className={`relative aspect-video rounded-2xl border-2 border-dashed overflow-hidden transition-colors ${draft.logoPreview ? "border-blue-300" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}
                  >
                    {draft.logoPreview ? (
                      <img
                        src={draft.logoPreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
                        <Camera className="w-8 h-8 text-gray-300" />
                        <p className="text-xs text-gray-400 font-medium">
                          Tap to upload restaurant photo
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect("logoFile", e.target.files)
                    }
                  />
                </label>

                {draft.logoPreview && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateDraft({
                        logoFile: undefined,
                        logoPreview: undefined,
                      });
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Menu Image Upload */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Menu Images (Upload as many as needed)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {draft.menuImagePreviews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-2xl border border-gray-100 overflow-hidden shadow-sm group"
                  >
                    <img
                      src={preview}
                      alt={`Menu ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeMenuImage(idx);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <label className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 p-4">
                  <Plus className="w-6 h-6 text-gray-300" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Add Page
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect("menuImageFiles", e.target.files)
                    }
                  />
                </label>
              </div>

              {draft.menuImagePreviews.length === 0 && (
                <div className="mt-3 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-none shadow-sm">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-[10px] text-indigo-900 leading-relaxed font-medium">
                    Upload clear photos of the menu pages. Our AI will
                    automatically extract all the dishes and prices for you!
                  </p>
                </div>
              )}
            </div>

            {/* Next button */}
            <button
              onClick={() => setTab("meals")}
              className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              Next: Add Meals <Utensils className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── MEALS TAB ───────────────────────────────────────── */}
        {tab === "meals" && (
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
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Find"
                  )}
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
                    const alreadyAdded = draft.meals.some(
                      (m) => m.menuItemId === meal.id,
                    );
                    return (
                      <button
                        key={meal.id}
                        onClick={() => !alreadyAdded && handleSelectMeal(meal)}
                        disabled={alreadyAdded}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${alreadyAdded ? "opacity-40 cursor-not-allowed" : "hover:bg-blue-50"}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-none overflow-hidden">
                          {meal.imageUrl ? (
                            <img
                              src={meal.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Utensils className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {meal.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {meal.category?.name || "Uncategorized"}
                          </p>
                        </div>
                        {alreadyAdded ? (
                          <span className="text-[9px] font-black text-emerald-500 uppercase">
                            Added
                          </span>
                        ) : (
                          <Plus className="w-4 h-4 text-blue-500 flex-none" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Meal Form (Price + Type + Restaurant Name) */}
            {showAddForm && selectedMeal && (
              <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedMeal.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {selectedMeal.category?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-1 rounded text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Restaurant-Specific Name
                  </label>
                  <input
                    type="text"
                    value={mealRestName}
                    onChange={(e) => setMealRestName(e.target.value)}
                    placeholder={`e.g. Killer ${selectedMeal.name} (Double Hot)`}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-blue-400"
                  />
                  <p className="text-[9px] text-gray-400 mt-1 italic">
                    What does this restaurant call this dish?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Price (ETB) *
                    </label>
                    <input
                      type="number"
                      value={mealPrice}
                      onChange={(e) => setMealPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Type
                    </label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-blue-400 bg-white"
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

            {/* AI Auto-Populate Button */}
            {draft.meals.length === 0 && (
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-[2.5rem] border border-indigo-100 p-8 text-center shadow-xl shadow-indigo-100/50">
                {/* Extraction Overlay */}
                {extracting && (
                  <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-8 transition-all animate-in fade-in duration-500">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600" />
                      <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight animate-bounce">
                      {DISTRACTION_MESSAGES[distractionIndex]}
                    </p>
                    <div className="mt-4 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full animate-[progress_10s_ease-in-out_infinite]"
                        style={{ width: "30%" }}
                      />
                    </div>
                    <style jsx>{`
                      @keyframes progress {
                        0% {
                          width: 5%;
                        }
                        50% {
                          width: 85%;
                        }
                        100% {
                          width: 95%;
                        }
                      }
                    `}</style>
                  </div>
                )}

                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-lg mb-6 border border-indigo-50">
                  <Wand2 className="w-8 h-8 text-indigo-500" />
                </div>

                <div className="space-y-2 mb-8">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">
                    AI Magic Tool
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                    {draft.menuImageFiles.length > 0
                      ? `I see your ${draft.menuImageFiles.length} menu photo(s)! I can identify all dishes and their prices for you automatically.`
                      : draft.menuImagePreviews.length > 0
                        ? "Photos are cached, but I need you to re-select them in the Info tab for my AI to read them."
                        : "Upload photos of the menu in the Info tab first, and I'll do the hard work for you."}
                  </p>
                </div>

                <button
                  onClick={handleAIExtract}
                  disabled={extracting}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-2xl ${
                    extracting
                      ? "bg-indigo-400 text-white cursor-wait"
                      : draft.menuImageFiles.length === 0
                        ? "bg-white text-gray-300 border border-gray-100 cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-indigo-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Use AI Magic
                </button>

                {draft.menuImageFiles.length > 0 && (
                  <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.1em] mt-4 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />{" "}
                    {draft.menuImageFiles.length} Images Attached
                  </p>
                )}
              </div>
            )}

            {/* Added Meals List */}
            {draft.meals.length > 0 ? (
              <div className="space-y-4">
                {foodMeals.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Utensils className="w-2.5 h-2.5" /> Food (
                      {foodMeals.length})
                    </p>
                    <div className="space-y-4">
                      {foodMeals.map((meal) => (
                        <MealEditor
                          key={meal.localId}
                          meal={meal}
                          onUpdate={(updates) => {
                            const newMeals = draft.meals.map((m) =>
                              m.localId === meal.localId
                                ? { ...m, ...updates }
                                : m,
                            );
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
                      <Coffee className="w-2.5 h-2.5" /> Drinks (
                      {drinkMeals.length})
                    </p>
                    <div className="space-y-4">
                      {drinkMeals.map((meal) => (
                        <MealEditor
                          key={meal.localId}
                          meal={meal}
                          onUpdate={(updates) => {
                            const newMeals = draft.meals.map((m) =>
                              m.localId === meal.localId
                                ? { ...m, ...updates }
                                : m,
                            );
                            updateDraft({ meals: newMeals });
                          }}
                          onRemove={() => removeMeal(meal.localId)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 py-16 text-center shadow-inner">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Utensils className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-sm text-gray-500 font-black uppercase tracking-tight">
                  No meals in draft
                </p>
                <p className="text-[10px] text-gray-400 mt-2 max-w-[200px] mx-auto leading-relaxed">
                  Search above to find dishes or use the AI magic tool to
                  extract them from your menu photos.
                </p>
              </div>
            )}

            {/* Submit Button */}
            {draft.meals.length > 0 && (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-700 transition-all disabled:opacity-40 flex items-center justify-center gap-3 shadow-2xl shadow-emerald-100 group"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                Confirm & Submit Restaurant
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Meal Editor Sub-Component ────────────────────────────────────────────
function MealEditor({
  meal,
  onUpdate,
  onRemove,
}: {
  meal: LocalMeal;
  onUpdate: (updates: Partial<LocalMeal>) => void;
  onRemove: () => void;
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

  return (
    <div
      className={`bg-white rounded-3xl border transition-all ${meal.isSelected ? "border-gray-100 shadow-xl shadow-gray-100/50" : "border-gray-100 opacity-60 bg-gray-50/50"}`}
    >
      {/* Header Section */}
      <div className="p-4 flex items-center gap-4">
        {/* Toggle Checkbox */}
        <button
          onClick={() => onUpdate({ isSelected: !meal.isSelected })}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors flex-none ${meal.isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200"}`}
        >
          {meal.isSelected && <CheckCircle2 className="w-4 h-4" />}
        </button>

        {/* Meal Thumbnail / Upload */}
        <label className="relative w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-none cursor-pointer group shadow-sm">
          {meal.imagePreview ? (
            <img
              src={meal.imagePreview}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Camera className="w-5 h-5 text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file)
                onUpdate({
                  imageFile: file,
                  imagePreview: URL.createObjectURL(file),
                });
            }}
          />
        </label>

        {/* Name and Basic Info */}
        <div
          className="flex-1 min-w-0"
          onClick={() => setIsEditing(!isEditing)}
        >
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">
              {meal.name}
            </p>
            <button className="text-gray-400 hover:text-gray-900">
              <ChevronLeft
                className={`w-4 h-4 transition-transform ${isEditing ? "rotate-90" : "-rotate-90"}`}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {meal.price} ETB
            </span>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest truncate">
              {meal.globalName}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-none items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
          >
            <Wand2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Editor */}
      {isEditing && (
        <div className="px-4 pb-6 pt-2 border-t border-gray-50 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Portion Size
              </label>
              <select
                value={meal.portionSize}
                onChange={(e) => onUpdate({ portionSize: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:border-indigo-300 bg-gray-50"
              >
                <option value="ONE_PERSON">Standard (1 person)</option>
                <option value="TWO_PERSONS">Medium (2 people)</option>
                <option value="FAMILY">Family Size</option>
                <option value="PER_KG">Per KG</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Dietary
              </label>
              <select
                value={meal.dietaryCategory}
                onChange={(e) => onUpdate({ dietaryCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:border-indigo-300 bg-gray-50"
              >
                <option value="YEFITSIK">🍖 Meat/Diary</option>
                <option value="YETSOM">🌱 Fasting/Vegan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Description
            </label>
            <textarea
              value={meal.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Describe the dish, ingredients, or specialty..."
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-xs font-medium focus:outline-none focus:border-indigo-300 bg-gray-50 min-h-[60px]"
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Price Adjustment (ETB)
            </label>
            <input
              type="number"
              value={meal.price}
              onChange={(e) =>
                onUpdate({ price: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:border-indigo-300 bg-gray-50"
            />
          </div>
        </div>
      )}

      {/* Global Menu Linker Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 space-y-6 animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Link to Global Menu
              </h3>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search global menu (e.g. Burger)..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-gray-100 text-sm focus:outline-none focus:border-indigo-300 bg-gray-50"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg"
                >
                  {searching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onUpdate({ menuItemId: r.id, globalName: r.name });
                      setSearchOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-none shadow-sm">
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Utensils className="w-5 h-5 text-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                        {r.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {r.category?.name || "Other"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
