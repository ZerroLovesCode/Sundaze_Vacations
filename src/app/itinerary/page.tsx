"use client";

import { useState } from "react";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import ExperienceEngine from "@/components/ExperienceEngine";
import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ItineraryPage() {
  const [budgetConstraint, setBudgetConstraint] = useState<number>(2500);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/10 bg-primary-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Paris Adventure</h1>
              <p className="text-xs text-primary-200">Oct 12 - Oct 15 • Romantic Vibe</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-white/5 rounded-full px-4 py-1.5 border border-white/10">
              <span className="text-sm text-primary-200">Budget:</span>
              <span className="text-sm font-semibold text-white">${budgetConstraint}</span>
            </div>
            <button className="flex items-center space-x-2 bg-accent-500 hover:bg-accent-400 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Collaborate</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <ItineraryTimeline />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[400px] flex-shrink-0"
        >
          <div className="sticky top-24">
            <ExperienceEngine 
              budget={budgetConstraint} 
              onBudgetChange={setBudgetConstraint} 
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
