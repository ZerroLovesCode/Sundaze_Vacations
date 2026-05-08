"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import ExperienceEngine from "@/components/ExperienceEngine";
import { ArrowLeft, Share2, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { DayPlan } from "@/lib/types";

function ItineraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const destination = searchParams.get("destination") || "Paris";
  const vibe = searchParams.get("vibe") || "Romantic";
  const initialDays = Number(searchParams.get("days") || "3");
  const tripId = searchParams.get("tripId");

  const [budgetConstraint, setBudgetConstraint] = useState<number>(2500);
  const [days, setDays] = useState<number>(initialDays);
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const saveTrip = useCallback(
    async (itineraryData: DayPlan[], budget: number, numDays: number) => {
      setSaving(true);
      try {
        const res = await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination, vibe, budget, days: numDays, itinerary: itineraryData }),
        });
        if (res.ok) {
          const { tripId: newTripId } = await res.json();
          const params = new URLSearchParams({ destination, vibe, days: String(numDays), tripId: newTripId });
          router.replace(`/itinerary?${params.toString()}`, { scroll: false });
        }
      } catch {
        console.warn("Failed to save trip to Firestore");
      } finally {
        setSaving(false);
      }
    },
    [destination, vibe, router]
  );

  // Load from Firestore if tripId exists, otherwise generate fresh
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        if (tripId) {
          const res = await fetch(`/api/trips?tripId=${tripId}`);
          if (res.ok) {
            const trip = await res.json();
            setItinerary(trip.itinerary);
            setBudgetConstraint(trip.budget ?? 2500);
            setDays(trip.days ?? initialDays);
            return;
          }
        }
        // No tripId or not found — generate fresh from Gemini
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination, vibe, budget: budgetConstraint, days }),
        });
        const data = await res.json();
        if (!res.ok) {
          setLoadError(data.error || "Failed to generate itinerary");
          return;
        }
        if (data.itinerary) {
          setItinerary(data.itinerary);
          await saveTrip(data.itinerary, budgetConstraint, days);
        }
      } catch {
        setLoadError("Something went wrong. Please go back and try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // destination and vibe are the only triggers for re-generation;
    // saveTrip, budgetConstraint, days intentionally excluded to prevent loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, vibe]);

  const handleCollaborate = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the URL
      window.getSelection()?.selectAllChildren(document.body);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip link */}
      <a
        href="#itinerary-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg"
      >
        Skip to itinerary
      </a>

      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/10 bg-primary-950/80" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{destination} Adventure</h1>
              <p className="text-xs text-primary-200">{days} days · {vibe} Vibe</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 border border-white/10"
              aria-label={`Budget: $${budgetConstraint.toLocaleString()}`}
            >
              <span className="text-sm text-primary-200">Budget:</span>
              <span className="text-sm font-semibold text-white">${budgetConstraint.toLocaleString()}</span>
            </div>
            {saving && <Loader2 className="w-4 h-4 animate-spin text-primary-300" aria-label="Saving trip..." />}
            <button
              onClick={handleCollaborate}
              className="flex items-center gap-2 bg-accent-500 hover:bg-accent-400 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label={copied ? "Link copied!" : "Copy shareable link"}
            >
              {copied ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Share2 className="w-4 h-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Collaborate"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        id="itinerary-content"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 min-w-0"
        >
          {loading ? (
            <div
              className="flex flex-col items-center justify-center h-64 gap-4"
              role="status"
              aria-live="polite"
              aria-label="Generating itinerary"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" aria-hidden="true" />
              <p className="text-primary-300 animate-pulse">
                {tripId ? "Loading your saved trip..." : "Generating your personalized itinerary with Gemini AI..."}
              </p>
            </div>
          ) : loadError ? (
            <div role="alert" className="text-center py-20">
              <p className="text-red-400 text-lg mb-4">{loadError}</p>
              <Link href="/" className="text-primary-300 underline hover:text-primary-100">
                Start over
              </Link>
            </div>
          ) : (
            <ItineraryTimeline days={itinerary} destination={destination} />
          )}
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[380px] flex-shrink-0"
          aria-label="Trip controls"
        >
          <div className="sticky top-24">
            <ExperienceEngine
              budget={budgetConstraint}
              onBudgetChange={setBudgetConstraint}
              destination={destination}
              vibe={vibe}
              days={days}
              onDaysChange={setDays}
              itinerary={itinerary}
              onUpdateItinerary={(newItinerary) => {
                setItinerary(newItinerary);
                saveTrip(newItinerary, budgetConstraint, days);
              }}
            />
          </div>
        </motion.aside>
      </main>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center" role="status">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" aria-label="Loading..." />
        </div>
      }
    >
      <ItineraryContent />
    </Suspense>
  );
}
