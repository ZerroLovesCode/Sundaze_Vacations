// Shared types for Voyager AI
// Used across API routes and React components

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  type: "sightseeing" | "food" | "culture" | "relaxation" | "adventure";
  cost: string;
  location?: string;
}

export interface DayPlan {
  day: string;
  date: string;
  activities: Activity[];
}

export interface GenerateRequest {
  destination: string;
  vibe: string;
  budget?: number;
  days?: number;
  wheelchairAccessible?: boolean;
  prompt?: string;
  existingItinerary?: DayPlan[];
}

export interface GenerateResponse {
  itinerary: DayPlan[];
}

export interface Trip {
  id: string;
  destination: string;
  vibe: string;
  budget: number;
  days: number;
  itinerary: DayPlan[];
  createdAt: number;
}
