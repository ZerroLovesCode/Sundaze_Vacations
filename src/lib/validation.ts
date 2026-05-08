/**
 * @file validation.ts
 *
 * Zod schemas for server-side request validation in Voyager AI API routes.
 *
 * Why Zod?
 *   - Provides runtime type-safety on top of TypeScript's compile-time checks.
 *   - Automatically trims whitespace from string fields (prevents padding attacks).
 *   - Enforces max lengths on user-controlled strings to limit prompt injection
 *     surface area before any content reaches the Gemini API.
 *   - Returns structured field-level errors that the client can display inline.
 */

import { z } from "zod";

/**
 * Schema for the body of POST /api/generate.
 *
 * Security constraints:
 *   - destination / vibe: max 100 chars each (prevents runaway prompt length)
 *   - prompt: max 500 chars (the primary injection-risk field)
 *   - budget: 100–50,000 USD (prevents negative or astronomical values)
 *   - days: 1–14 (keeps Gemini output size predictable and cost-bounded)
 */
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

  // Defaults applied here so the API always has a concrete value to work with.
  budget: z.number().min(100).max(50000).optional().default(2500),
  days: z.number().int().min(1).max(14).optional().default(3),
  wheelchairAccessible: z.boolean().optional().default(false),

  /** Natural-language refinement prompt from the Experience Engine sidebar. */
  prompt: z
    .string()
    .max(500, "Refinement prompt must be under 500 characters")
    .trim()
    .optional(),

  /**
   * Existing itinerary JSON sent during refinements.
   * Typed as z.array(z.any()) because the deep Activity/DayPlan shape is
   * already validated when the data was first generated; re-validating it
   * here would add unnecessary latency.
   */
  existingItinerary: z.array(z.any()).optional(),
});

/** Inferred TypeScript type from the schema — use this in route handlers. */
export type ValidatedGenerateRequest = z.infer<typeof GenerateRequestSchema>;
