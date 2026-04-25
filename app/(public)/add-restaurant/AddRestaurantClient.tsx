"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bulkSubmitRestaurant } from "./actions";
import { extractMealsFromImage } from "./ai-actions";
import {
  ChevronLeft,
  Upload,
  Store,
  Utensils,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import InfoTab from "./tabs/InfoTab";
import MealsTab from "./tabs/MealsTab";
import PreviewTab from "./tabs/PreviewTab";

import { 
  saveFileLocal, 
  getFileLocal, 
  removeFileLocal, 
  clearFilesLocal, 
  compressImage 
} from "@/lib/local-draft-store";

// ── Types ────────────────────────────────────────────────────────────────
export interface LocalMeal {
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

export interface DraftRestaurant {
  name: string;
  location: string;
  geoLocation: string;
  logoFile?: File;
  logoPreview?: string;
  menuImageFiles: File[];
  menuImagePreviews: string[];
  meals: LocalMeal[];
}

const STORAGE_KEY = "zmenu_draft_restaurant";

function loadDraft(): DraftRestaurant {
  if (typeof window === "undefined")
    return {
      name: "",
      location: "",
      geoLocation: "",
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
    geoLocation: "",
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
      geoLocation: draft.geoLocation,
      logoPreview: draft.logoPreview,
      menuImagePreviews: draft.menuImagePreviews,
      meals: draft.meals.map((m) => ({
        ...m,
        imageFile: undefined,
        imagePreview: m.imagePreview,
        localId: m.localId,
        menuItemId: m.menuItemId,
        name: m.name,
        price: m.price,
        foodCategoryType: m.foodCategoryType,
        dietaryCategory: m.dietaryCategory,
        portionSize: m.portionSize,
        spicyLevel: m.spicyLevel,
        isSelected: m.isSelected,
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {}
}

type Tab = "info" | "meals" | "preview";

export default function AddRestaurantClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("info");
  const [draft, setDraft] = useState<DraftRestaurant>({
    name: "",
    location: "",
    geoLocation: "",
    menuImageFiles: [],
    menuImagePreviews: [],
    meals: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<"compressing" | "uploading" | "finalizing" | "none">("none");
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load draft on mount to avoid hydration mismatch
  useEffect(() => {
    async function restore() {
      const saved = loadDraft();
      
      // Restore files from IndexedDB
      if (saved.logoPreview) {
        const file = await getFileLocal("logo");
        if (file) saved.logoFile = file;
      }

      // Restore menu images
      const menuFiles: File[] = [];
      for (let i = 0; i < (saved.menuImagePreviews?.length || 0); i++) {
        const file = await getFileLocal(`menu_${i}`);
        if (file) menuFiles.push(file);
      }
      saved.menuImageFiles = menuFiles;

      // Restore meal images
      for (const meal of saved.meals) {
        const file = await getFileLocal(`meal_${meal.localId}`);
        if (file) meal.imageFile = file;
      }

      setDraft(saved);
      setIsLoaded(true);
    }
    restore();
  }, []);

  const [extracting, setExtracting] = useState(false);
  const [distractionIndex, setDistractionIndex] = useState(0);

  // Cycle distraction messages
  useEffect(() => {
    if (!extracting) return;
    const interval = setInterval(() => {
      setDistractionIndex((prev) => (prev + 1) % 9);
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
  const handleFileSelect = async (
    field: "logoFile" | "menuImageFiles",
    files: FileList | null,
  ) => {
    if (!files || files.length === 0) return;

    if (field === "logoFile") {
      const file = await compressImage(files[0]);
      await saveFileLocal("logo", file);
      const preview = URL.createObjectURL(file);
      updateDraft({ logoFile: file, logoPreview: preview });
    } else {
      const newFiles = Array.from(files);
      const processedFiles: File[] = [];
      const processedPreviews: string[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const compressed = await compressImage(newFiles[i]);
        const idx = draft.menuImageFiles.length + i;
        await saveFileLocal(`menu_${idx}`, compressed);
        processedFiles.push(compressed);
        processedPreviews.push(URL.createObjectURL(compressed));
      }

      updateDraft({
        menuImageFiles: [...draft.menuImageFiles, ...processedFiles],
        menuImagePreviews: [...draft.menuImagePreviews, ...processedPreviews],
      });
    }
  };

  const removeMenuImage = async (index: number) => {
    const newFiles = [...draft.menuImageFiles];
    const newPreviews = [...draft.menuImagePreviews];
    
    // Cleanup IndexedDB
    await removeFileLocal(`menu_${index}`);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    // Re-index remaining files in DB to maintain consistency
    for (let i = index; i < newFiles.length; i++) {
       const file = newFiles[i];
       await saveFileLocal(`menu_${i}`, file);
    }
    await removeFileLocal(`menu_${newFiles.length}`);

    updateDraft({ menuImageFiles: newFiles, menuImagePreviews: newPreviews });
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

  const removeMeal = async (localId: string) => {
    await removeFileLocal(`meal_${localId}`);
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
    setSubmitStep("compressing");

    try {
      const fd = new FormData();
      fd.append("name", draft.name.trim());
      fd.append("location", draft.location.trim());
      if (draft.geoLocation) fd.append("geoLocation", draft.geoLocation.trim());
      if (draft.logoFile) fd.append("logo", draft.logoFile);
      
      if (draft.menuImageFiles.length > 0) {
        fd.append("menuImage", draft.menuImageFiles[0]);
        draft.menuImageFiles.forEach((file) => {
          fd.append("menuImages", file);
        });
      }

      const sourceData = {
        source: "PUBLIC_USER",
        metadata: {
          userAgent: navigator.userAgent,
          platform: (navigator as any).platform,
          submittedAt: new Date().toISOString(),
          totalImagesUploaded: draft.menuImageFiles.length,
        },
      };
      fd.append("sourceInfo", JSON.stringify(sourceData));

      const selectedMeals = draft.meals.filter((m) => m.isSelected);
      const mealsData = selectedMeals.map((m) => ({
        localId: m.localId, // Added localId for unique image mapping
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
        if (m.imageFile) fd.append(`mealImage_${m.localId}`, m.imageFile);
      });

      // Proactive size check (20MB limit)
      const MAX_SIZE = 20 * 1024 * 1024;
      let totalSize = 0;
      if (draft.logoFile) totalSize += draft.logoFile.size;
      draft.menuImageFiles.forEach(f => totalSize += f.size);
      selectedMeals.forEach(m => {
        if (m.imageFile) totalSize += m.imageFile.size;
      });

      if (totalSize > MAX_SIZE) {
        alert(`Your upload is too large (${(totalSize / 1024 / 1024).toFixed(1)}MB). The limit is 20MB. Please try using fewer photos or smaller images.`);
        setSubmitting(false);
        setSubmitStep("none");
        return;
      }

      setSubmitStep("uploading");
      const result = await bulkSubmitRestaurant(fd);
      
      if (result.success) {
        setSubmitStep("finalizing");
        localStorage.removeItem(STORAGE_KEY);
        await clearFilesLocal(); // Wipe IndexedDB on success
        setSubmitResult(result.data);
        setSubmitted(true);
      } else {
        alert("Submission Error: " + (result.error || "The server rejected the request. Try again with fewer images."));
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      if (err.message?.includes("exceeded")) {
        alert("The photos are too large to upload at once. Try removing some meal photos and adding them later.");
      } else {
        alert("We couldn't submit your restaurant. Error: " + (err.message || "Unknown error"));
      }
    } finally {
      setSubmitting(false);
      setSubmitStep("none");
    }
  };

  if (submitting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-gray-100 rounded-full animate-spin border-t-indigo-600" />
          <div className="absolute inset-0 flex items-center justify-center">
             {submitStep === "compressing" && <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />}
             {submitStep === "uploading" && <Upload className="w-8 h-8 text-blue-500 animate-bounce" />}
             {submitStep === "finalizing" && <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-pulse" />}
          </div>
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {submitStep === "compressing" && "Packing Photos..."}
            {submitStep === "uploading" && "Sending to Server..."}
            {submitStep === "finalizing" && "Finalizing..."}
          </h2>
          <p className="text-gray-400 font-medium max-w-[280px] mx-auto text-sm leading-relaxed italic">
            {submitStep === "compressing" && "We're shrinking your high-quality photos for a faster upload."}
            {submitStep === "uploading" && "Your restaurant data is on its way. This might take a minute depending on your internet."}
            {submitStep === "finalizing" && "Everything is set! We're just saving the final details to the community database."}
          </p>
        </div>

        {submitStep === "uploading" && (
           <div className="w-full max-w-[200px] bg-gray-50 rounded-full h-1 overflow-hidden">
             <div className="h-full bg-indigo-600 animate-pulse w-full origin-left" />
           </div>
        )}
      </div>
    );
  }

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
                Step {tab === "info" ? "1" : tab === "meals" ? "2" : "3"} of 3
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
            <span className="hidden xs:inline">Submit</span>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex max-w-2xl mx-auto border-t border-gray-50 bg-white">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${tab === "info" ? "text-gray-900 border-gray-900 bg-gray-50/50" : "text-gray-400 border-transparent hover:text-gray-600"}`}
          >
            <Store className="w-3.5 h-3.5" /> Info
          </button>
          <button
            onClick={() => setTab("meals")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${tab === "meals" ? "text-gray-900 border-gray-900 bg-gray-50/50" : "text-gray-400 border-transparent hover:text-gray-600"}`}
          >
            <Utensils className="w-3.5 h-3.5" /> Meals ({draft.meals.length})
          </button>
          <button
            onClick={() => setTab("preview")}
            disabled={!canSubmit || draft.meals.length === 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 disabled:opacity-30 ${tab === "preview" ? "text-indigo-600 border-indigo-600 bg-indigo-50/30" : "text-gray-400 border-transparent hover:text-indigo-400"}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Preview
          </button>
        </div>
      </div>

      {/* Tab Content Rendering */}
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6">
        {tab === "info" && (
          <InfoTab 
            draft={draft} 
            updateDraft={updateDraft} 
            handleFileSelect={handleFileSelect} 
            removeMenuImage={removeMenuImage}
            setTab={setTab}
          />
        )}
        {tab === "meals" && (
          <MealsTab 
            draft={draft} 
            updateDraft={updateDraft} 
            handleAIExtract={handleAIExtract}
            extracting={extracting}
            distractionIndex={distractionIndex}
            removeMeal={removeMeal}
            handleSubmit={handleSubmit}
            canSubmit={canSubmit}
            submitting={submitting}
            setTab={setTab}
          />
        )}
        {tab === "preview" && (
          <PreviewTab 
            draft={draft}
            handleSubmit={handleSubmit}
            submitting={submitting}
            canSubmit={canSubmit}
            setTab={setTab}
          />
        )}
      </div>
    </div>
  );
}
