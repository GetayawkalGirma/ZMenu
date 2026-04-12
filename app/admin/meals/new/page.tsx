"use client";

import { useState } from "react";
import { MealForm } from "@/components/meal/MealForm";
import { createOrUpdateMenuItem } from "@/app/admin/restaurant-management/menu-item-actions";
import { useRouter } from "next/navigation";
import type { MealFormData } from "@/lib/types/meal";

export default function NewMealPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: MealFormData) => {
    setLoading(true);
    try {
      const result = await createOrUpdateMenuItem({
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        tags: data.tags,
        image: data.image,
        removeImage: data.removeImage,
      });

      if (result.success) {
        router.push("/admin/meals");
        router.refresh();
      } else {
        alert(`Failed to create meal: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to create meal:", error);
      alert("Failed to create meal");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/meals");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <MealForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              mode="global"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
