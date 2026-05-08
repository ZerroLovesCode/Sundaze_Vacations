/**
 * @file route.ts — POST /api/generate
 *
 * The core AI endpoint for Voyager AI.
 * Accepts a travel request (destination, vibe, budget, constraints) from the
 * client, builds a structured prompt, sends it to Google Gemini, and returns
 * a typed JSON itinerary array.
 *
 * Security notes:
 *  - All incoming request bodies are validated with Zod before touching the AI.
 *  - The API key is server-side only (no NEXT_PUBLIC_ prefix).
 *  - Response is CDN-cacheable for 5 minutes to reduce redundant Gemini calls.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerateRequestSchema } from "@/lib/validation";
import type { DayPlan, GenerateResponse } from "@/lib/types";

// ---------------------------------------------------------------------------
// Gemini client — instantiated once at module level (not per-request) so the
// SDK can reuse its internal HTTP connection pool across invocations.
// ---------------------------------------------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Guard: reject immediately if the API key is not configured in the env.
  if (!genAI) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  // ---------------------------------------------------------------------------
  // Step 1: Validate and sanitize the request body with Zod.
  //
  // This protects against:
  //   - Prompt injection (max 500 chars on the refinement prompt)
  //   - Out-of-range budget values
  //   - Missing required fields
  //   - Non-numeric or excessively large day counts
  // ---------------------------------------------------------------------------
  let validated;
  try {
    const body = await req.json();
    const result = GenerateRequestSchema.safeParse(body);

    if (!result.success) {
      // Return structured field-level errors so the client can surface them.
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    validated = result.data;
  } catch {
    // req.json() will throw if the body is not valid JSON.
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  const { destination, vibe, budget, days, wheelchairAccessible, prompt, existingItinerary } = validated;

  try {
    // ---------------------------------------------------------------------------
    // Step 2: Initialise the Gemini model.
    //
    // We use gemini-2.5-flash for the best balance of speed and quality.
    // responseMimeType: "application/json" instructs the model to emit
    // pure JSON — no markdown fences, no preamble.
    // ---------------------------------------------------------------------------
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // ---------------------------------------------------------------------------
    // Step 3: Build the system prompt.
    //
    // Three optional clauses are composed conditionally:
    //   • accessibilityClause — injected when the user requires wheelchair access
    //   • refinementClause    — injected when the user is refining an existing
    //                           itinerary (passes the existing JSON as context so
    //                           Gemini only modifies the requested days rather
    //                           than regenerating everything from scratch)
    // ---------------------------------------------------------------------------
    const accessibilityClause = wheelchairAccessible
      ? "All venues and activities MUST be wheelchair accessible. Avoid stairs, rough terrain, and inaccessible venues."
      : "";

    // Only send refinement context when both a prompt AND existing itinerary are present.
    const refinementClause = prompt && existingItinerary
      ? `\n\nThe user already has this itinerary:\n${JSON.stringify(existingItinerary)}\n\nApply only this refinement request to it: "${prompt}". Modify only the necessary days/activities, keeping the rest intact.`
      : "";

    const systemPrompt = `You are a personalized travel experience engine. Generate a highly specific, realistic ${days}-day travel itinerary for ${destination} based on the vibe: "${vibe}".
The total max budget for the entire trip is $${budget}. Distribute costs realistically across activities.
${accessibilityClause}
Each activity must include a realistic location name within ${destination}.

Your response MUST be a valid JSON array of day objects matching this schema exactly:
[
  {
    "day": "Day 1",
    "date": "Oct 12",
    "activities": [
      {
        "id": "unique-string-id",
        "time": "10:00 AM",
        "title": "Activity Title",
        "description": "2-3 sentence description with local insight.",
        "type": "sightseeing" | "food" | "culture" | "relaxation" | "adventure",
        "cost": "$20",
        "location": "Specific venue or neighborhood name"
      }
    ]
  }
]
${refinementClause}
Return ONLY the JSON array. No markdown, no explanation.`;

    // ---------------------------------------------------------------------------
    // Step 4: Call Gemini and parse the response.
    //
    // We validate that the parsed value is actually an array — Gemini occasionally
    // wraps the result in an object even when the schema says otherwise.
    // ---------------------------------------------------------------------------
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    let itinerary: DayPlan[];
    try {
      itinerary = JSON.parse(text);
      if (!Array.isArray(itinerary)) throw new Error("Response is not an array");
    } catch (e) {
      console.error("Failed to parse Gemini JSON response:", text);
      throw new Error("AI returned an invalid itinerary format");
    }

    const response: GenerateResponse = { itinerary };

    // ---------------------------------------------------------------------------
    // Step 5: Return the itinerary with CDN cache headers.
    //
    // s-maxage=300  → Cloud Run's load balancer / CDN caches identical requests
    //                 for 5 minutes, avoiding redundant Gemini API calls.
    // stale-while-revalidate=600 → serve stale data for up to 10 more minutes
    //                              while a fresh response is fetched in the bg.
    // ---------------------------------------------------------------------------
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate itinerary";
    console.error("Generate API Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
