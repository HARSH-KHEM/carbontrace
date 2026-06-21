# CarbonTrace

**CarbonTrace** — an AI-powered carbon footprint tracking and leaderboard platform.

> Built by Harsh, Software Engineering @ DTU, for Virtual Prompt Hackathon.

## What it does

CarbonTrace gamifies and simplifies environmental awareness. Users can effortlessly log their daily activities via an intelligent conversational interface powered by an AI calculator (EcoBot). Behind the scenes, the LLM parses your activities into precise CO2 estimates across four major categories: **Transport, Food, Energy, and Shopping**. 

Instead of just tracking emissions, CarbonTrace highlights what you *saved* by choosing eco-friendly alternatives. As you log activities, you earn points, level up, and compete globally on the public leaderboard.

## Key Features

- **AI-Powered Activity Logging:** Simply type your day out (e.g., "I took the bus to work and had a vegan lunch") and the integrated LLM calculates the precise carbon cost.
- **Dynamic Leaderboard:** A fully public ranking system highlighting the top eco-trackers with distinct visual glow effects.
- **Public Profiles:** Clickable user profiles allowing the community to view others' progress, streaks, CO2 saved, and current levels.
- **Activity History:** Transparency is built-in; clicking on a logged day reveals the raw input descriptions side-by-side with the calculated carbon footprint.
- **Points & Ranking System:** A transparent leveling formula (`Level = floor(impact_score / 100) + 1`) that pushes you from "Getting Started" to "Sustainability Leader."
- **Robust Security:** Completely decoupled public and private data (`profiles` vs `profile_private`). Secured with Supabase Row Level Security (RLS) to prevent IDOR attacks and data leaks.

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, RPC, RLS)
- **AI Calculator:** Groq API (Llama 3.3 70B Versatile model)
- **Charts:** Recharts

## Architecture

For an in-depth look at how the AI calculator passes data to the database, how stats are recalculated atomically, and how security boundaries are enforced via RLS, see the [Architecture Documentation](ARCHITECTURE.md).

## Running Locally

To run this project locally, clone the repo and follow these steps:

1. **Install dependencies:**
   ```bash
   cd app
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file inside the `app` directory with the following variable keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROK_API_KEY=your_groq_api_key
   ```
   *(Note: The Groq API key is required for the AI calculator route to function).*

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
