"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Store, Navigation, MapPin } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { formatPrice, cn } from "@/lib/utils";

export type VenueSort =
  | "recommended"
  | "price-low"
  | "price-high"
  | "venue-az"
  | "venue-za";

const PAGE_SIZE = 12;

/** Same ~5 km bounding box as `RestaurantRepository` near-me filter */
const LAT_RANGE = 0.045;
const LNG_RANGE = 0.045;

function inNearMeBounds(
  lat: number | null | undefined,
  lng: number | null | undefined,
  userLat: number,
  userLng: number
): boolean {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return false;
  return (
    lat >= userLat - LAT_RANGE &&
    lat <= userLat + LAT_RANGE &&
    lng >= userLng - LNG_RANGE &&
    lng <= userLng + LNG_RANGE
  );
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type Listing = {
  id: string;
  name: string;
  price: number;
  portionSize?: string | null;
  isAvailable: boolean;
  restaurantId: string;
  imageUrl?: string | null;
  restaurant?: {
    name?: string | null;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
};

interface Props {
  listings: Listing[];
  fallbackImageUrl: string;
}

export default function MealListingsClient({
  listings,
  fallbackImageUrl,
}: Props) {
  const [sort, setSort] = useState<VenueSort>("recommended");
  const [nearMe, setNearMe] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleNearMeToggle = useCallback(() => {
    if (nearMe) {
      setNearMe(false);
      setUserCoords(null);
      return;
    }
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setNearMe(true);
      },
      () => {
        alert("Could not get your location. Please enable location services.");
        setNearMe(false);
        setUserCoords(null);
      }
    );
  }, [nearMe]);

  const sorted = useMemo(() => {
    let list = [...listings];
    if (nearMe && userCoords) {
      list = list.filter((r) =>
        inNearMeBounds(
          r.restaurant?.latitude ?? null,
          r.restaurant?.longitude ?? null,
          userCoords.lat,
          userCoords.lng
        )
      );
    }

    const byName = (a: Listing, b: Listing) =>
      (a.restaurant?.name || "").localeCompare(b.restaurant?.name || "", undefined, {
        sensitivity: "base",
      });

    const byDistance = (a: Listing, b: Listing) => {
      const la = a.restaurant?.latitude;
      const loa = a.restaurant?.longitude;
      const lb = b.restaurant?.latitude;
      const lob = b.restaurant?.longitude;
      if (
        la == null ||
        loa == null ||
        lb == null ||
        lob == null ||
        !userCoords
      ) {
        return 0;
      }
      const da = haversineKm(userCoords.lat, userCoords.lng, la, loa);
      const db = haversineKm(userCoords.lat, userCoords.lng, lb, lob);
      return da - db;
    };

    switch (sort) {
      case "price-low":
        return list.sort((a, b) => a.price - b.price);
      case "price-high":
        return list.sort((a, b) => b.price - a.price);
      case "venue-az":
        return list.sort(byName);
      case "venue-za":
        return list.sort((a, b) => byName(b, a));
      case "recommended":
      default:
        if (nearMe && userCoords) {
          return list.sort((a, b) => {
            const d = byDistance(a, b);
            if (d !== 0) return d;
            if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
            return byName(a, b);
          });
        }
        return list.sort((a, b) => {
          if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
          return byName(a, b);
        });
    }
  }, [listings, sort, nearMe, userCoords]);

  const shown = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sort, nearMe, userCoords, listings.length]);

  const loadMore = useCallback(() => {
    setVisibleCount((v) => Math.min(v + PAGE_SIZE, sorted.length));
  }, [sorted.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "240px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore, visibleCount, sorted.length]);

  const filterButtons: { id: VenueSort; label: string }[] = [
    { id: "recommended", label: "Recommended" },
    { id: "price-low", label: "Price low" },
    { id: "price-high", label: "Price high" },
    { id: "venue-az", label: "Venue A–Z" },
    { id: "venue-za", label: "Venue Z–A" },
  ];

  if (listings.length === 0) {
    return (
      <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-gray-100 rounded-[2rem]">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          No Listings Available
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-10">
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm max-w-full">
            {filterButtons.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSort(id)}
                className={cn(
                  "px-3 py-1.5 sm:px-4 sm:py-2 text-[7px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all",
                  sort === id
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-400 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center sm:justify-end">
          <button
            type="button"
            onClick={handleNearMeToggle}
            className={cn(
              "flex items-center gap-2 text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all",
              nearMe
                ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100"
                : "border-gray-200 bg-white text-gray-500 hover:border-indigo-200 hover:bg-indigo-50/50"
            )}
          >
            <MapPin className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0", nearMe && "text-white")} />
            {nearMe ? "Near me (on)" : "Near me"}
          </button>
        </div>
        {nearMe && sorted.length === 0 && (
          <p className="text-center text-xs text-gray-500 max-w-md mx-auto">
            No venues in this meal listing are within ~5 km of you, or they don&apos;t have map
            coordinates yet. Turn off Near me to see all venues.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
        {shown.map((rm) => (
          <Card
            key={rm.id}
            className="group overflow-hidden border-0 shadow-sm shadow-gray-200 hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-3xl bg-white"
          >
            <div className="flex flex-col relative h-full">
              <div className="relative w-full aspect-square sm:h-48 overflow-hidden shrink-0">
                <img
                  src={rm.imageUrl || fallbackImageUrl || "https://placehold.co/600x400?text=Premium+Meal"}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  alt={rm.name}
                />
                <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20 px-1.5 h-4 sm:h-5 bg-gray-900/80 backdrop-blur-md rounded-md flex items-center justify-center text-white text-[6px] sm:text-[7px] font-black uppercase tracking-widest">
                  {rm.portionSize || "1P"}
                </div>
                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-20 bg-white/95 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg shadow-xl border border-white/20">
                  <span className="text-[10px] sm:text-base font-black text-green-600">
                    {formatPrice(rm.price)}
                  </span>
                </div>
              </div>

              <div className="p-2 sm:p-6 flex flex-col justify-between flex-1 space-y-2 sm:space-y-4 min-h-0">
                <div className="space-y-1 sm:space-y-2 min-w-0">
                  <div className="flex items-start gap-1 text-[7px] sm:text-[9px] font-black text-blue-600 uppercase tracking-widest">
                    <Store className="w-2 sm:w-2.5 h-2 sm:h-2.5 mr-0.5 shrink-0 mt-0.5" />
                    <span className="break-words leading-tight">{rm.restaurant?.name}</span>
                  </div>
                  <h3 className="text-[10px] sm:text-lg font-black text-gray-900 tracking-tight uppercase leading-tight break-words group-hover:text-blue-600 transition-colors">
                    {rm.name}
                  </h3>

                  <div className="flex items-start gap-1 text-[7px] sm:text-[10px] font-bold text-gray-500 normal-case tracking-normal">
                    <Navigation className="w-2 sm:w-2.5 h-2 sm:h-2.5 mr-0.5 shrink-0 mt-0.5 text-gray-300" />
                    <span className="break-words leading-snug">
                      {rm.restaurant?.location?.trim() || "Addis Ababa"}
                    </span>
                  </div>
                </div>

                <div className="pt-1 sm:pt-2 border-t border-gray-50 flex items-center justify-between gap-1">
                  <div
                    className={cn(
                      "px-1 py-0.5 rounded-md border text-[6px] font-black uppercase tracking-widest hidden xs:block",
                      rm.isAvailable
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                        : "text-gray-400 bg-gray-50 border-gray-100"
                    )}
                  >
                    {rm.isAvailable ? "In Stock" : "Sold Out"}
                  </div>
                  <Link href={`/restaurants/${rm.restaurantId}`} className="flex-1 sm:flex-none">
                    <Button
                      size="sm"
                      className="w-full sm:w-auto h-7 sm:h-8 rounded-md sm:rounded-lg bg-gray-900 hover:bg-black font-black text-[7px] sm:text-[8px] uppercase tracking-widest transition-all px-2"
                    >
                      Menu
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="h-8 w-full flex items-center justify-center py-6">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Loading more…
          </span>
        </div>
      )}
    </>
  );
}
