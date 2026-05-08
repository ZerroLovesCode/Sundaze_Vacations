"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Sparkles, Navigation, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [vibe, setVibe] = useState("");
  const [days, setDays] = useState(3);
  const router = useRouter();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      destination: destination.trim(),
      vibe: vibe.trim(),
      days: String(days),
    });
    router.push(`/itinerary?${params.toString()}`);
  };

  const vibeOptions = ["Romantic", "Adventure", "Foodie", "Cultural", "Relaxed", "Budget"];

  return (
    <>
      {/* Skip to main content for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden bg-gradient-to-b from-primary-950 to-background"
      >
        {/* Decorative background blobs — hidden from assistive tech */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[100px]" aria-hidden="true" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-600/20 blur-[100px]" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 w-full max-w-4xl flex flex-col items-center text-center space-y-8"
        >
          <div
            className="inline-flex items-center space-x-2 glass-panel px-4 py-2 rounded-full text-sm text-primary-200 border-primary-500/20"
            aria-hidden="true"
          >
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span>Voyager AI Experience Engine</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Design your perfect <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
              adventure.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
            Hyper-personalized travel itineraries powered by Google Gemini AI. Tell us where you&apos;re going, pick your vibe, and explore.
          </p>

          <form
            onSubmit={handleGenerate}
            className="w-full max-w-3xl mt-8"
            aria-label="Trip planning form"
            noValidate
          >
            <div className="glass-panel p-4 rounded-2xl flex flex-col gap-4 shadow-2xl">
              {/* Destination */}
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10 hover:bg-white/10 transition-colors focus-within:border-primary-500/40 focus-within:ring-1 focus-within:ring-primary-500/20">
                <MapPin className="text-primary-300 w-5 h-5 shrink-0" aria-hidden="true" />
                <label htmlFor="destination" className="sr-only">Destination</label>
                <input
                  id="destination"
                  type="text"
                  placeholder="Where to? (e.g. Tokyo, Barcelona)"
                  className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-full text-lg"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  maxLength={100}
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Vibe */}
                <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10 hover:bg-white/10 transition-colors focus-within:border-primary-500/40 focus-within:ring-1 focus-within:ring-primary-500/20">
                  <Navigation className="text-accent-300 w-5 h-5 shrink-0" aria-hidden="true" />
                  <label htmlFor="vibe" className="sr-only">Trip Vibe</label>
                  <input
                    id="vibe"
                    type="text"
                    list="vibe-options"
                    placeholder="What's the vibe?"
                    className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-full text-lg"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    required
                    maxLength={100}
                  />
                  <datalist id="vibe-options">
                    {vibeOptions.map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </div>

                {/* Days */}
                <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10 hover:bg-white/10 transition-colors focus-within:border-primary-500/40 sm:w-44">
                  <CalendarDays className="text-primary-300 w-5 h-5 shrink-0" aria-hidden="true" />
                  <label htmlFor="days-input" className="sr-only">Number of days</label>
                  <input
                    id="days-input"
                    type="number"
                    min={1}
                    max={14}
                    value={days}
                    onChange={(e) => setDays(Math.min(14, Math.max(1, Number(e.target.value))))}
                    className="bg-transparent border-none outline-none text-white w-12 text-lg"
                    aria-label="Trip duration in days"
                  />
                  <span className="text-white/60 text-sm">days</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <span>Plan My Adventure</span>
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* Vibe quick-select chips */}
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Quick vibe selection">
            {vibeOptions.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVibe(v)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                  vibe === v
                    ? "bg-primary-500 border-primary-400 text-white"
                    : "bg-white/5 border-white/10 text-primary-200 hover:bg-white/10 hover:border-white/20"
                }`}
                aria-pressed={vibe === v}
              >
                {v}
              </button>
            ))}
          </div>
        </motion.div>
      </main>
    </>
  );
}
