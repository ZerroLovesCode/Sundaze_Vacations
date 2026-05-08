import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc, getDoc } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import type { Trip } from "@/lib/types";

// POST /api/trips — save a generated trip to Firestore
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const trip: Omit<Trip, "id"> = await req.json();
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await setDoc(doc(db, "trips", tripId), {
      ...trip,
      id: tripId,
      createdAt: Date.now(),
    });

    return NextResponse.json({ tripId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save trip";
    console.error("Trips POST Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/trips?tripId=xxx — fetch a saved trip from Firestore
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const tripId = req.nextUrl.searchParams.get("tripId");
    if (!tripId) {
      return NextResponse.json({ error: "tripId is required" }, { status: 400 });
    }

    const docSnap = await getDoc(doc(db, "trips", tripId));
    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(docSnap.data() as Trip, {
      headers: { "Cache-Control": "public, s-maxage=60" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch trip";
    console.error("Trips GET Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
