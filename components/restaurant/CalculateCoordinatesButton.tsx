"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Crosshair, Loader2 } from "lucide-react";
import { calculateCoordinates } from "@/app/admin/restaurant-management/actions";

export function CalculateCoordinatesButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const result = await calculateCoordinates(id);
      if (result.success) {
        alert("Coordinates updated successfully!");
        // Page will revalidate via server action
      } else {
        alert(result.error || "Failed to calculate coordinates");
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCalculate}
      disabled={loading}
      variant="outline"
      className="w-full h-11 rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Crosshair className="w-3.5 h-3.5" />
      )}
      Calculate Geodata
    </Button>
  );
}
