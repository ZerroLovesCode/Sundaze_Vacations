import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GenerateRequestSchema } from "@/lib/validation";
import type { DayPlan, GenerateResponse } from "@/lib/types";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!genAI) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  // --- Input Validation (Security) ---
  let validated;
  try {
    const body = await req.json();
    const result = GenerateRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    validated = result.data;
  } catch {
    return NextResponse.json({ error: "Malformed request body" }, { status: 400 });
  }

  const { destination, vibe, budget, days, wheelchairAccessible, prompt, existingItinerary } = validated;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // Build a rich, constraint-aware system prompt
    const accessibilityClause = wheelchairAccessible
      ? "All venues and activities MUST be wheelchair accessible. Avoid stairs, rough terrain, and inaccessible venues."
      : "";

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

    return NextResponse.json(response, {
      headers: {
        // Cache identical destination+vibe requests for 5 minutes at the CDN layer
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate itinerary";
    console.error("Generate API Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
