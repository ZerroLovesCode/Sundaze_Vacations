"use client";

import { MapPin, Clock, Star, Navigation, Coffee } from "lucide-react";
import { motion } from "framer-motion";

const mockDays = [
  {
    day: "Day 1",
    date: "Oct 12",
    activities: [
      {
        id: "a1",
        time: "10:00 AM",
        title: "Eiffel Tower Picnic",
        description: "Start the trip with a beautiful view. Grab croissants from a local bakery nearby.",
        type: "sightseeing",
        icon: Navigation,
        cost: "$0",
      },
      {
        id: "a2",
        time: "01:00 PM",
        title: "Café de Flore",
        description: "Classic Parisian lunch in Saint-Germain-des-Prés.",
        type: "food",
        icon: Coffee,
        cost: "$45",
      }
    ]
  },
  {
    day: "Day 2",
    date: "Oct 13",
    activities: [
      {
        id: "a3",
        time: "09:30 AM",
        title: "Louvre Museum",
        description: "Focus on the Renaissance wing based on your 'Art Lover' vibe preference.",
        type: "culture",
        icon: Star,
        cost: "$20",
      }
    ]
  }
];

export default function ItineraryTimeline() {
  return (
    <div className="space-y-8">
      {mockDays.map((dayObj, dayIdx) => (
        <div key={dayObj.day} className="relative">
          <div className="flex items-baseline space-x-4 mb-6">
            <h2 className="text-2xl font-bold text-white">{dayObj.day}</h2>
            <span className="text-sm font-medium text-primary-300">{dayObj.date}</span>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary-500/50 before:to-transparent">
            {dayObj.activities.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={activity.id} 
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl border border-white/5 hover:border-primary-500/30 transition-colors shadow-lg bg-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                      <h3 className="font-bold text-lg text-white">{activity.title}</h3>
                      <div className="flex items-center space-x-2 text-xs font-semibold text-accent-300 bg-accent-500/10 px-2 py-1 rounded-md w-fit">
                        <Clock className="w-3 h-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-primary-100 mb-3 leading-relaxed">{activity.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-1 text-xs text-primary-300">
                        <MapPin className="w-3 h-3" />
                        <span>Paris, FR</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400">{activity.cost}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
