/**
 * @file route.ts — POST /api/trips  |  GET /api/trips?tripId=xxx
 *
 * Firestore persistence layer for Voyager AI trips.
 *
 * POST — Saves a generated itinerary to Firestore and returns a unique tripId.
 *         The client embeds this tripId in the shareable URL so collaborators
 *         can load the same trip without re-calling Gemini.
 *
 * GET  — Fetches a previously saved trip by tripId.
 *         Responses are CDN-cacheable for 60 seconds to reduce Firestore reads
 *         when multiple collaborators load the same shared link.
 *
 * Implementation note:
 *   We intentionally use `firebase/firestore/lite` (REST-based) rather than the
 *   full `firebase/firestore` SDK (WebSocket/gRPC). The full SDK is designed for
 *   browser clients that maintain persistent real-time connections — using it in
 *   a server-side Next.js API route causes runaway gRPC stream errors and
 *   extremely slow response times. The lite SDK makes a single HTTP request per
 *   operation, which is the correct pattern for serverless environments.
 */

import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc, getDoc } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import type { Trip } from "@/lib/types";

// ---------------------------------------------------------------------------
// POST /api/trips
// Saves an itinerary to the "trips" Firestore collection.
// The tripId is a time-based random string — this avoids needing Auth while
// keeping IDs unguessable enough for a hackathon demo context.
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const trip: Omit<Trip, "id"> = await req.json();

    // Generate a collision-resistant ID without a UUID library dependency.
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // setDoc writes (or overwrites) the document atomically.
    await setDoc(doc(db, "trips", tripId), {
      ...trip,
      id: tripId,
      createdAt: Date.now(), // Unix ms timestamp — useful for TTL rules later
    });

    return NextResponse.json({ tripId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save trip";
    console.error("Trips POST Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/trips?tripId=xxx
// Retrieves a saved trip from Firestore by its tripId.
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const tripId = req.nextUrl.searchParams.get("tripId");
    if (!tripId) {
      return NextResponse.json({ error: "tripId is required" }, { status: 400 });
    }

    const docSnap = await getDoc(doc(db, "trips", tripId));
    if (!docSnap.exists()) {
      // Return 404 so the client falls back to generating a fresh itinerary.
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(docSnap.data() as Trip, {
      headers: {
        // Cache the fetched trip for 60 seconds — safe because trips are
        // immutable once saved (refinements create a new save, not an update).
        "Cache-Control": "public, s-maxage=60",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch trip";
    console.error("Trips GET Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
