import { z } from "zod";

export const GenerateRequestSchema = z.object({
  destination: z
    .string()
    .min(1, "Destination is required")
    .max(100, "Destination must be under 100 characters")
    .trim(),
  vibe: z
    .string()
    .min(1, "Vibe is required")
    .max(100, "Vibe must be under 100 characters")
    .trim(),
  budget: z.number().min(100).max(50000).optional().default(2500),
  days: z.number().int().min(1).max(14).optional().default(3),
  wheelchairAccessible: z.boolean().optional().default(false),
  prompt: z
    .string()
    .max(500, "Refinement prompt must be under 500 characters")
    .trim()
    .optional(),
  existingItinerary: z.array(z.any()).optional(),
});

export type ValidatedGenerateRequest = z.infer<typeof GenerateRequestSchema>;
