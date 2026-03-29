export interface Restaurant {
  id: string;
  name: string;
  location: string;
  logoUrl?: string;
  logoId?: string | null;
  menuImageUrl?: string;
  menuImageId?: string | null;
  features: RestaurantFeatures;
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
  logo?: File;
  features: {
    isLuxury: boolean;
    isGrabAndGo: boolean;
    noiseLevel: NoiseLevel;
    privacyLevel: PrivacyLevel;
  };
  menuImage?: File;
  removeLogo?: boolean;
  removeMenuImage?: boolean;
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
