"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { toggleRestaurantStatus } from "@/app/admin/restaurant-management/actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function RestaurantStatusToggle({ 
    id, 
    currentStatus 
}: { 
    id: string; 
    currentStatus: string;
}) {
    const [loading, setLoading] = useState(false);
    const isPublished = currentStatus === "PUBLISHED";

    const handleToggle = async () => {
        setLoading(true);
        try {
            await toggleRestaurantStatus(id, currentStatus);
        } catch (error) {
            console.error("Failed to toggle status:", error);
            alert("Failed to update status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={isPublished ? "outline" : "primary"}
            onClick={handleToggle}
            disabled={loading}
            className={cn(
                "w-full flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-sm transition-all",
                isPublished 
                    ? "border-green-100 text-green-700 hover:bg-green-50 hover:text-green-800" 
                    : "bg-green-600 hover:bg-green-700 text-white shadow-green-100 border-0"
            )}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPublished ? (
                <>
                    <EyeOff className="w-4 h-4" />
                    Unpublish
                </>
            ) : (
                <>
                    <Eye className="w-4 h-4" />
                    Publish Now
                </>
            )}
        </Button>
    );
}
