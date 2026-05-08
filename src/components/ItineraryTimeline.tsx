"use client";

import { MapPin, Clock, Star, Navigation, Coffee, Sunset, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Activity, DayPlan } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

const TYPE_ICON_MAP: Record<Activity["type"], LucideIcon> = {
  sightseeing: Navigation,
  food: Coffee,
  culture: Star,
  relaxation: Sunset,
  adventure: Zap,
};

const TYPE_COLOR_MAP: Record<Activity["type"], string> = {
  sightseeing: "bg-primary-500",
  food: "bg-orange-500",
  culture: "bg-purple-500",
  relaxation: "bg-teal-500",
  adventure: "bg-rose-500",
};

interface Props {
  days: DayPlan[];
  destination: string;
}

export default function ItineraryTimeline({ days = [], destination }: Props) {
  const getIcon = (type: Activity["type"]): LucideIcon =>
    TYPE_ICON_MAP[type] ?? MapPin;

  const getColor = (type: Activity["type"]): string =>
    TYPE_COLOR_MAP[type] ?? "bg-primary-500";

  if (!days || days.length === 0) {
    return (
      <div
        className="text-center py-20 text-primary-300"
        role="status"
        aria-live="polite"
      >
        <Navigation className="w-12 h-12 mx-auto mb-4 opacity-30" aria-hidden="true" />
        <p>Your personalized itinerary will appear here.</p>
      </div>
    );
  }

  return (
    <div
      aria-label="Trip itinerary"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={days.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-10"
        >
          {days.map((dayObj, dayIdx) => (
            <section key={`${dayObj.day}-${dayIdx}`} aria-labelledby={`day-heading-${dayIdx}`}>
              <div className="flex items-baseline gap-3 mb-5">
                <h2
                  id={`day-heading-${dayIdx}`}
                  className="text-2xl font-bold text-white"
                >
                  {dayObj.day}
                </h2>
                <span className="text-sm font-medium text-primary-300">{dayObj.date}</span>
              </div>

              <ol
                role="list"
                className="space-y-5 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary-500/60 before:to-transparent"
                aria-label={`Activities for ${dayObj.day}`}
              >
                {dayObj.activities.map((activity, idx) => {
                  const Icon = getIcon(activity.type);
                  const color = getColor(activity.type);
                  return (
                    <motion.li
                      role="listitem"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dayIdx * 0.05 + idx * 0.08 }}
                      key={activity.id}
                      className="relative flex items-start gap-4 group"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${color} shadow-lg shrink-0 z-10 text-white mt-0.5`}
                        aria-hidden="true"
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Card */}
                      <div className="flex-1 glass-panel p-4 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all duration-200 shadow-lg bg-white/5 focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/30">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1">
                          <h3 className="font-bold text-base text-white leading-tight">
                            {activity.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-300 bg-accent-500/10 px-2 py-1 rounded-md w-fit shrink-0">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <time>{activity.time}</time>
                          </div>
                        </div>
                        <p className="text-sm text-primary-100 leading-relaxed mb-3">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <div className="flex items-center gap-1 text-xs text-primary-300">
                            <MapPin className="w-3 h-3" aria-hidden="true" />
                            <span>{activity.location ?? destination}</span>
                          </div>
                          <span className="text-sm font-semibold text-emerald-400">
                            <span className="sr-only">Cost: </span>
                            {activity.cost}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
