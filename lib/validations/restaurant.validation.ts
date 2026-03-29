import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(1, "Restaurant name is required")
    .max(100, "Restaurant name must be less than 100 characters")
    .trim(),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location must be less than 200 characters")
    .trim(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  logo: z.any().optional(), // File object
  menuImageUrl: z.string().url().optional().or(z.literal('')),
  menuImage: z.any().optional(), // File object
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
  noiselevel: z.string().optional(),
  privacylevel: z.string().optional(),
  featureIds: z.array(z.string()).optional(),
  removeLogo: z.boolean().optional(),
  removeMenuImage: z.boolean().optional(),
  logoId: z.string().optional(),
  menuImageId: z.string().optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
