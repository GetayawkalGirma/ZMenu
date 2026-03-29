// Re-export all types from centralized location
export * from './restaurant';
export * from './meal';
export * from './file';

// Common/shared types that don't belong to specific modules
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  features?: string[];
  location?: string;
}
