"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Sparkles, Navigation } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [vibe, setVibe] = useState("");
  const router = useRouter();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/itinerary");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden bg-gradient-to-b from-primary-950 to-background">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-600/20 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 w-full max-w-4xl flex flex-col items-center text-center space-y-8"
      >
        <div className="inline-flex items-center space-x-2 glass-panel px-4 py-2 rounded-full text-sm text-primary-200 mb-4 border-primary-500/20">
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span>Voyager AI Experience Engine</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm">
          Design your perfect <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
            adventure.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
          Discover hyper-personalized itineraries powered by generative AI. Tell us where you're going and what vibe you're chasing.
        </p>

        <form onSubmit={handleGenerate} className="w-full max-w-3xl mt-8">
          <div className="glass-panel p-2 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-2xl">
            <div className="flex-1 flex items-center space-x-3 bg-white/5 rounded-xl px-4 py-3 w-full border border-white/10 hover:bg-white/10 transition-colors">
              <MapPin className="text-primary-300 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Where to?" 
                className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-full text-lg"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="flex-1 flex items-center space-x-3 bg-white/5 rounded-xl px-4 py-3 w-full border border-white/10 hover:bg-white/10 transition-colors">
              <Navigation className="text-accent-300 w-5 h-5" />
              <input 
                type="text" 
                placeholder="What's the vibe? (e.g. Chill, Foodie)" 
                className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-full text-lg"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/25 flex items-center justify-center space-x-2"
            >
              <span>Explore</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
