"use strict";
"use client";

import { useState } from "react";
import { Sparkles, SlidersHorizontal, Settings2, Loader2 } from "lucide-react";

interface Props {
  budget: number;
  onBudgetChange: (val: number) => void;
}

export default function ExperienceEngine({ budget, onBudgetChange }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setPrompt("");
    }, 1500);
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-primary-950/40">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-accent-400" />
        <h2 className="font-semibold text-white">Experience Engine</h2>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <label className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Refine Vibe</span>
          </label>
          <form onSubmit={handleUpdate} className="space-y-3">
            <textarea
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary-500/50 resize-none h-24 transition-colors"
              placeholder="e.g. 'Make Day 2 more relaxing' or 'Swap museum for a food tour'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading || !prompt}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? "Regenerating..." : "Update Itinerary"}</span>
            </button>
          </form>
        </div>

        <div className="pt-4 border-t border-white/10">
          <label className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-3 flex items-center space-x-1">
            <Settings2 className="w-3 h-3" />
            <span>Constraints</span>
          </label>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1 text-primary-100">
                <span>Max Budget</span>
                <span className="font-semibold text-white">${budget}</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="10000" 
                step="100"
                value={budget}
                onChange={(e) => onBudgetChange(Number(e.target.value))}
                className="w-full accent-accent-500"
              />
            </div>
            <div className="flex items-center space-x-2 bg-black/20 p-3 rounded-xl border border-white/5">
              <input type="checkbox" id="accessibility" className="rounded text-primary-500 focus:ring-primary-500 bg-black/20 border-white/20" />
              <label htmlFor="accessibility" className="text-sm text-primary-100 cursor-pointer">Require Wheelchair Access</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
