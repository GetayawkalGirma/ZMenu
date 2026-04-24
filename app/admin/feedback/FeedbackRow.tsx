"use client";

import { useState, useEffect } from "react";
import { 
  Badge, 
  Button, 
  Card 
} from "@/components/ui";
import { 
  Check, 
  X, 
  Clock, 
  Utensils, 
  Camera,
  Store,
  ArrowRight,
  ChevronRight,
  Loader2
} from "lucide-react";
import { approveMealFeedback, rejectFeedback, approveImageFeedback } from "./admin-actions";

export function FeedbackRow({ feedback }: { feedback: any }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImageAssign, setShowImageAssign] = useState(false);
  const [restaurantMeals, setRestaurantMeals] = useState<any[]>([]);
  const [selectedMealId, setSelectedMealId] = useState("");

  const isMealInfo = feedback.type === 'MEAL_INFO';

  // Fetch meals if it's an image feedback to allow assignment
  useEffect(() => {
    if (feedback.type === 'MENU_IMAGES' && showImageAssign) {
      fetch(`/api/restaurants/${feedback.restaurantId}/meals`)
        .then(res => res.json())
        .then(data => setRestaurantMeals(data.items || []));
    }
  }, [feedback.type, feedback.restaurantId, showImageAssign]);

  const handleApproveMeal = async () => {
    setIsProcessing(true);
    await approveMealFeedback(feedback.id);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await rejectFeedback(feedback.id);
    setIsProcessing(false);
  };

  const handleApproveImage = async (imageUrl: string) => {
    if (!selectedMealId) return;
    setIsProcessing(true);
    await approveImageFeedback(feedback.id, selectedMealId, imageUrl);
    setIsProcessing(false);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8">
        {/* Left Side - Context */}
        <div className="md:w-1/3 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isMealInfo ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {isMealInfo ? <Utensils className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                {feedback.type.replace('_', ' ')}
              </p>
              <h3 className="text-lg font-black tracking-tighter text-gray-900 uppercase leading-none">
                {isMealInfo ? feedback.restaurantMenu?.name : 'Menu Photo Upload'}
              </h3>
            </div>
          </div>

          <div className="flex items-center text-gray-500 text-xs font-bold uppercase tracking-tight bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
            <Store className="w-3.5 h-3.5 mr-2 text-indigo-400" />
            {feedback.restaurant?.name}
          </div>

          <div className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest pl-1">
            <Clock className="w-3 h-3 mr-2" />
            {new Date(feedback.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Middle - Content */}
        <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 border border-gray-50">
          {isMealInfo ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {feedback.suggestedPrice && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price Update</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400 line-through">{feedback.restaurantMenu?.price}</span>
                    <ArrowRight className="w-3 h-3 text-gray-300" />
                    <span className="text-lg font-black text-zinc-900">{feedback.suggestedPrice} ETB</span>
                  </div>
                </div>
              )}
              {feedback.suggestedPortionSize && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Portion Size</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400 line-through uppercase tracking-tighter">{feedback.restaurantMenu?.portionSize}</span>
                    <ArrowRight className="w-3 h-3 text-gray-300" />
                    <span className="text-sm font-black text-zinc-900 uppercase tracking-tighter">{feedback.suggestedPortionSize}</span>
                  </div>
                </div>
              )}
              {feedback.suggestedPreparationTime && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prep Time</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400 line-through">{feedback.restaurantMenu?.preparationTime}m</span>
                    <ArrowRight className="w-3 h-3 text-gray-300" />
                    <span className="text-lg font-black text-zinc-900">{feedback.suggestedPreparationTime}m</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {feedback.uploadedImageUrls.map((url: string, i: number) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm relative group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setShowImageAssign(true)}
                        className="p-2 bg-white rounded-full text-zinc-900 shadow-xl"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showImageAssign && (
                <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-xl shadow-indigo-50/50 space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Assign Image to Meal</p>
                  <div className="flex gap-3">
                    <select 
                      value={selectedMealId}
                      onChange={(e) => setSelectedMealId(e.target.value)}
                      className="flex-1 h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="">Select a meal...</option>
                      {restaurantMeals.map((meal: any) => (
                        <option key={meal.id} value={meal.id}>{meal.name}</option>
                      ))}
                    </select>
                    <Button 
                      disabled={!selectedMealId || isProcessing}
                      onClick={() => handleApproveImage(feedback.uploadedImageUrls[0])}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-black uppercase tracking-widest text-[10px]"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex md:flex-col justify-end gap-3 min-w-[140px]">
          {isMealInfo && (
            <Button 
              onClick={handleApproveMeal}
              disabled={isProcessing}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12 md:h-14 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-100 transition-all active:scale-95"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Approve</>}
            </Button>
          )}
          <Button 
            onClick={handleReject}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 h-12 md:h-14 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Reject</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
