import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z
    .string()
    .min(1, "Feature name is required")
    .max(100, "Feature name must be less than 100 characters")
    .trim(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export const updateFeatureSchema = createFeatureSchema.partial();

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;
