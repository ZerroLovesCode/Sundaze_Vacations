"use client";

import { useState } from "react";
import { Sparkles, SlidersHorizontal, Settings2, Loader2, CalendarDays, Accessibility } from "lucide-react";
import type { DayPlan } from "@/lib/types";

interface Props {
  budget: number;
  onBudgetChange: (val: number) => void;
  destination: string;
  vibe: string;
  days: number;
  onDaysChange: (val: number) => void;
  itinerary: DayPlan[];
  onUpdateItinerary: (newItinerary: DayPlan[]) => void;
}

export default function ExperienceEngine({
  budget,
  onBudgetChange,
  destination,
  vibe,
  days,
  onDaysChange,
  itinerary,
  onUpdateItinerary,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          vibe,
          budget,
          days,
          wheelchairAccessible,
          prompt,
          existingItinerary: itinerary, // send context so Gemini refines, not regenerates
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update itinerary");
        return;
      }
      if (data.itinerary) {
        onUpdateItinerary(data.itinerary);
      }
      setPrompt("");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-primary-950/40"
      role="complementary"
      aria-label="Experience Engine — refine your itinerary"
    >
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-accent-400" aria-hidden="true" />
        <h2 className="font-semibold text-white text-base">Experience Engine</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Vibe Refinement */}
        <section aria-labelledby="refine-heading">
          <p
            id="refine-heading"
            className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2 flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3 h-3" aria-hidden="true" />
            Refine Your Trip
          </p>
          <form onSubmit={handleUpdate} className="space-y-3" aria-label="Refine itinerary form">
            <label htmlFor="refine-prompt" className="sr-only">
              Describe changes to your itinerary
            </label>
            <textarea
              id="refine-prompt"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 resize-none h-24 transition-colors"
              placeholder="e.g. 'Make Day 2 more relaxing' or 'Add a local street food tour'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={500}
              aria-describedby={error ? "refine-error" : undefined}
            />
            <p
              id="refine-error"
              role="alert"
              aria-live="assertive"
              className={`text-sm text-red-400 ${error ? '' : 'sr-only'}`}
            >
              {error ?? ''}
            </p>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-busy={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{loading ? "Regenerating..." : "Update Itinerary"}</span>
            </button>
          </form>
        </section>

        {/* Constraints */}
        <section aria-labelledby="constraints-heading" className="pt-4 border-t border-white/10 space-y-4">
          <p
            id="constraints-heading"
            className="text-xs font-semibold text-primary-300 uppercase tracking-wider flex items-center gap-1"
          >
            <Settings2 className="w-3 h-3" aria-hidden="true" />
            Constraints
          </p>

          {/* Budget slider */}
          <div>
            <div className="flex justify-between text-sm mb-1 text-primary-100">
              <label htmlFor="budget-slider" className="flex items-center gap-1">
                Max Budget
              </label>
              <span className="font-semibold text-white" aria-live="polite">
                ${budget.toLocaleString()}
              </span>
            </div>
            <input
              id="budget-slider"
              type="range"
              min="500"
              max="10000"
              step="100"
              value={budget}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              className="w-full accent-accent-500 cursor-pointer"
              aria-valuemin={500}
              aria-valuemax={10000}
              aria-valuenow={budget}
              aria-label={`Budget: $${budget}`}
            />
          </div>

          {/* Days input */}
          <div>
            <label htmlFor="days-input" className="text-sm text-primary-100 flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4" aria-hidden="true" />
              Trip Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                id="days-input"
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => onDaysChange(Math.min(14, Math.max(1, Number(e.target.value))))}
                className="w-20 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30"
                aria-label="Number of days"
              />
              <span className="text-sm text-primary-300">days</span>
            </div>
          </div>

          {/* Accessibility */}
          <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
            <input
              type="checkbox"
              id="wheelchair-access"
              checked={wheelchairAccessible}
              onChange={(e) => setWheelchairAccessible(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-500 bg-black/20 border-white/20 w-4 h-4 cursor-pointer"
              aria-label="Require wheelchair accessible venues"
            />
            <label htmlFor="wheelchair-access" className="text-sm text-primary-100 cursor-pointer flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-primary-300" aria-hidden="true" />
              Wheelchair Accessible
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
