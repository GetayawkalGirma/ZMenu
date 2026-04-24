"use client";

import { useState } from "react";
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui";
import { Camera, ImagePlus, Loader2, X, CheckCircle2 } from "lucide-react";
import { submitRestaurantImageFeedback } from "@/app/(public)/feedback.actions";

// Server action to handle the actual file upload to Supabase
// This avoids exposing Supabase keys or complex client-side logic
import { uploadMenuImagesAction } from "@/app/(public)/restaurants/[id]/upload-action";

export function MenuImageUpload({ restaurantId }: { restaurantId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("restaurantId", restaurantId);

      const res = await uploadMenuImagesAction(formData);
      
      if (res.success && res.urls) {
        // Now create the feedback record
        await submitRestaurantImageFeedback({
          restaurantId,
          uploadedImageUrls: res.urls
        });
        
        setIsSuccess(true);
        setFiles([]);
        setTimeout(() => {
          setIsSuccess(false);
          setIsOpen(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center bg-white border-2 border-dashed border-gray-200 text-gray-400 px-6 sm:px-8 h-12 sm:h-16 rounded-xl sm:rounded-[2rem] font-black uppercase tracking-[0.1em] text-[10px] sm:text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all group"
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
          Upload Menu Photos
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-gray-50/50">
          <DialogTitle className="text-2xl font-black tracking-tighter uppercase text-gray-900 flex items-center gap-3">
            <ImagePlus className="w-6 h-6 text-indigo-600" />
            Add Menu Images
          </DialogTitle>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Help us keep the menu up to date
          </p>
        </DialogHeader>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-tight">Upload Received!</h4>
            <p className="text-gray-500 font-medium italic">
              Thank you for helping us improve. We will review these photos and update the menu shortly.
            </p>
          </div>
        ) : (
          <div className="p-8 pt-4 space-y-6">
            {/* Dropzone/Input Area */}
            <div 
              className="border-2 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center bg-gray-50/30 hover:bg-gray-50 hover:border-indigo-200 transition-all cursor-pointer relative group"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input 
                id="file-upload"
                type="file" 
                multiple 
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImagePlus className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-sm font-black uppercase tracking-tight text-gray-900">
                Click to select photos
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                PNG, JPG or WEBP (Max 5MB each)
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {files.map((file, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-100 relative overflow-hidden group">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button 
              disabled={files.length === 0 || isUploading}
              onClick={handleUpload}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading {files.length} Photos...</span>
                </div>
              ) : (
                "Submit Menu Photos"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
