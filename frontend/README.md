# Mandi Mitra — Frontend

## What is this?
The web dashboard for Mandi Mitra, an AI-powered crop pooling and auction platform for Indian smallholder farmers. Three role-based portals:

- **Farmer Portal** — View active pools, track contributions, see settlement earnings
- **Buyer Portal** — Browse live auctions, place bids with real-time countdown timers, view settlements  
- **Admin Dashboard** — Monitor system health, manage farmers and buyers, view pool activity

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management with localStorage persistence)
- React Query (server state, 5s polling for live auctions)
- next-intl (6 languages: English, Hindi, Tamil, Telugu, Kannada, Marathi)
- Leaflet (catchment area maps)
- Recharts (data visualization)

## Sarvam AI Integration
The frontend connects to a FastAPI backend that uses:
- **Saaras v2.5** — Speech-to-text for farmer IVR calls (Tamil, Hindi, Telugu, Kannada, Marathi)
- **Bulbul v3** — Text-to-speech for outbound callbacks to farmers and buyers
- **Sarvam-2 LLM** — Structured data extraction from voice transcripts

## Running Locally
```bash
npm install
npm run dev
```

Requires the backend running on port 8000:
```bash
cd ../backend
python -m uvicorn app:app --port 8000
```

## Environment Variables
Copy `.env.local.example` to `.env.local`:

NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_DEMO_MODE=true
