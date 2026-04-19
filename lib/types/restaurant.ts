export interface Restaurant {
  id: string;
  name: string;
  location: string;
  logoUrl?: string | null;
  logoId?: string | null;
  menuImageUrl?: string | null;
  menuImageId?: string | null;
  features: RestaurantFeatures;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantFeatures {
  isLuxury: boolean;
  isGrabAndGo: boolean;
  noiseLevel: NoiseLevel;
  privacyLevel: PrivacyLevel;
}

export interface RestaurantFormData {
  name: string;
  location: string;
  geoLocation?: string;
  logo?: File;
  features: {
    isLuxury: boolean;
    isGrabAndGo: boolean;
    noiseLevel: NoiseLevel;
    privacyLevel: PrivacyLevel;
  };
  menuImage?: File;
  status?: "DRAFT" | "PUBLISHED";
  removeLogo?: boolean;
  removeMenuImage?: boolean;
  latitude?: number;
  longitude?: number;
}

export enum NoiseLevel {
  QUIET = "quiet",
  MODERATE = "moderate",
  LOUD = "loud",
}

export enum PrivacyLevel {
  PRIVATE = "private",
  SEMI_PRIVATE = "semi_private",
  PUBLIC = "public",
}
