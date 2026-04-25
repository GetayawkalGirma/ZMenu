"use client";

import { Store, Search, Camera, Trash2, Plus, X, CheckCircle2 } from "lucide-react";
import type { DraftRestaurant } from "../AddRestaurantClient";

interface InfoTabProps {
  draft: DraftRestaurant;
  updateDraft: (updates: Partial<DraftRestaurant>) => void;
  handleFileSelect: (field: "logoFile" | "menuImageFiles", files: FileList | null) => void;
  removeMenuImage: (index: number) => void;
  setTab: (tab: "info" | "meals" | "preview") => void;
}

export default function InfoTab({
  draft,
  updateDraft,
  handleFileSelect,
  removeMenuImage,
  setTab
}: InfoTabProps) {
  return (
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

      {/* Geo Location (Iframe) */}
      <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-blue-500" />
            Google Maps Embed Code (Optional)
          </label>
          <textarea
            value={draft.geoLocation}
            onChange={(e) => updateDraft({ geoLocation: e.target.value })}
            placeholder="Paste <iframe ...> code here"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-blue-400 bg-white min-h-[100px]"
          />
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-tight">
            How to get the code:
          </p>
          <ol className="text-[10px] text-gray-500 space-y-2 list-decimal ml-4 font-medium">
            <li>Search for your restaurant on <strong>Google Maps</strong>.</li>
            <li>Click the <strong>"Share"</strong> button.</li>
            <li>Select the <strong>"Embed a map"</strong> tab.</li>
            <li>Click <strong>"Copy HTML"</strong> and paste it here!</li>
          </ol>
        </div>

        {draft.geoLocation?.includes("<iframe") && (
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] text-emerald-700 font-bold uppercase">Map Detected Successfully</span>
          </div>
        )}
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
          Restaurant Photo or Logo
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
                  <p className="text-xs text-gray-400 font-medium text-center px-4">
                    Tap to upload restaurant photo or logo
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect("logoFile", e.target.files)}
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
            <p className="text-[10px] text-gray-400 font-bold uppercase text-center">
              Add Page
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect("menuImageFiles", e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={() => setTab("meals")}
        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
      >
        Next: Add Meals <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
