"use client";

import { useState } from "react";
import { MenuItemSearch } from "@/components/meal/MenuItemSearch";
import { RestaurantMenuForm } from "@/components/meal/RestaurantMenuForm";
import { RestaurantMenuCard } from "@/components/meal/RestaurantMenuCard";
import { Button, Card, CardContent } from "@/components/ui";
import { Plus, ChevronRight } from "lucide-react";
import type { MenuItem, RestaurantMenu, RestaurantMenuFormData } from "@/lib/types/meal";

interface AddRestaurantMenuProps {
  restaurantId: string;
  existingItems: RestaurantMenu[];
  onAdd: (data: RestaurantMenuFormData) => Promise<void>;
  onUpdate?: (id: string, data: RestaurantMenuFormData) => Promise<void>;
  onEdit?: (item: RestaurantMenu) => void;
  onDelete?: (restaurantMenuId: string) => void;
  loading?: boolean;
}

export function AddRestaurantMenu({
  restaurantId,
  existingItems,
  onAdd,
  onUpdate,
  onEdit,
  onDelete,
  loading = false,
}: AddRestaurantMenuProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<RestaurantMenu | null>(null);

  const handleSelectMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
  };

  const handleClearSelection = () => {
    setSelectedMenuItem(null);
  };

  const handleSubmit = async (data: RestaurantMenuFormData) => {
    setSaving(true);
    try {
      if (editingItem && onUpdate) {
        await onUpdate(editingItem.id, data);
      } else {
        await onAdd(data);
      }
      setShowForm(false);
      setSelectedMenuItem(null);
      setEditingItem(null);
    } catch {
      // parent handles error display
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedMenuItem(null);
    setEditingItem(null);
  };

  const handleEditItem = (item: RestaurantMenu) => {
    if (onEdit) {
      onEdit(item);
    } else {
      setEditingItem(item);
      setSelectedMenuItem(item.menuItem || null);
      setShowForm(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Search for a global meal, then add restaurant-specific details
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Menu Item
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6 space-y-5">
            {/* Step 1: Search and select */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs">
                  1
                </span>
                Select a Global Meal
              </div>
              <MenuItemSearch
                onSelect={handleSelectMenuItem}
                selectedItem={selectedMenuItem}
                onClear={handleClearSelection}
              />
            </div>

            {/* Step 2: Fill restaurant-specific fields */}
            {selectedMenuItem && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs">
                    2
                  </span>
                  Restaurant-Specific Details
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <RestaurantMenuForm
                    restaurantId={restaurantId}
                    menuItemId={selectedMenuItem.id}
                    menuItemName={selectedMenuItem.name}
                    initialData={editingItem || undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={saving}
                  />
                </div>
              </div>
            )}

            {!selectedMenuItem && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
                  Search and select a meal above to continue
                  <ChevronRight className="h-3.5 w-3.5" />
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Items Grid */}
      {existingItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {existingItems.map((item) => (
            <RestaurantMenuCard
              key={item.id}
              restaurantMenu={item}
              onEdit={() => handleEditItem(item)}
              onDelete={
                onDelete
                  ? () => onDelete(item.id)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        !showForm && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <div className="text-gray-300 text-5xl mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4c.2.8.9 1.2 1.7 1.2h10.4c.8 0 1.5-.4 1.7-1.2l1.6-7.4"/><path d="m9 11 1 9"/><path d="m15 11-1 9"/></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No menu items yet
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Add meals from the global menu to this restaurant
                </p>
                <Button onClick={() => setShowForm(true)}>
                  Add Your First Item
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
