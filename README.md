# Voyager AI: Real-Time Experience Engine

Voyager is a dynamic travel planning application developed for the Hackathon. It utilizes generative AI to create hyper-personalized itineraries while respecting real-world constraints and syncing updates in real-time.

## 🚀 Core Functionalities

1.  **Travel Planning:** Automated day-by-day scheduling for any global destination.
2.  **Experience Engine:** Uses GPT-4o-mini to curate activities based on "vibe" and niche preferences rather than just popular landmarks.
3.  **Dynamic Preferences:** Users can pivot their trip mid-way (e.g., "Change Day 3 to be more relaxing") and the engine recalculates.
4.  **Constraint Logic:** Integrated budget tracking and physical accessibility constraints validated by the AI.
5.  **Real-time Updates:** Powered by Supabase Realtime, allowing multi-user collaboration on a single trip itinerary.

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (React), Tailwind CSS, Lucide Icons.
- **Backend:** Next.js API Routes (Serverless).
- **AI Engine:** OpenAI API (Structured Outputs).
- **Database:** Supabase (PostgreSQL).
- **Real-time:** Supabase Broadcast/Presence.
- **Deployment:** Vercel.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API Key
- Supabase Project URL & Anon Key

### Environment Variables
Create a `.env.local` file:
```env
OPENAI_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here