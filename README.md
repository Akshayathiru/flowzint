# Mandi Mitra
FPO-level bargaining power for every farmer through a phone call.

## Problem
100M+ small farmers in India sell 30-50% below market price because they lack bargaining power and depend on middlemen. Existing solutions need smartphones — excluding those who need help most.

## Solution
Farmers call a number, speak naturally in Tamil/Hindi/Telugu, and get pooled with nearby farmers selling the same crop. Live auction opens for registered buyers. Highest bidder wins. AI calls farmer back to confirm. Zero manual steps.

## Sarvam AI Integration
Three Sarvam APIs power the entire farmer experience:
- Sarvam Saaras STT: converts speech to text in any Indian language
- Sarvam LLM (sarvam-m): conversational NLP extracts crop/quantity/location/name naturally
- Sarvam TTS (bulbul:v1): speaks confirmation back to farmer in their own language
No Sarvam call = no pool = no auction = no deal.
Sarvam is the foundation, not a feature.

## Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, App Router, TypeScript, Tailwind CSS, Shadcn UI, Zustand, TanStack Query, Recharts, Leaflet, next-intl |
| **Backend** | FastAPI, Python 3.11, SQLAlchemy, SQLite/PostgreSQL, Socket.io |
| **AI / Voice** | Sarvam AI (Saaras STT, Sarvam-2 LLM, Bulbul TTS), Twilio Voice API |

## Complete Workflow
1. Farmer calls → Sarvam STT → Sarvam LLM conversation
2. Sarvam TTS confirms back → farmer confirms
3. Pool fills → threshold hit → auction opens
4. Buyers bid live on WebSocket dashboard
5. Anti-snipe timer → cascade allocation → receipts
6. Bulbul calls farmer → farmer accepts/rejects
7. Payment confirmation → trust score updates

## Architecture
```
┌──────────────────────────────────────────────────────────┐
│  FARMER CALLS (Twilio + Sarvam Saaras STT)               │
│  "80 kilo tomato, Kanchipuram"                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  SARVAM LLM — Conversational Entity Extraction          │
│  → crop: "tomato", qty: 80, location: "kanchipuram"     │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  POOLING ENGINE — Geo-bounded, threshold-based           │
│  → Groups nearby farmers by crop & location              │
│  → Closes at 250kg threshold or 90-minute ceiling        │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  LIVE AUCTION ENGINE (WebSocket Dashboard)               │
│  → Accepts bids with atomic locking + anti-sniping       │
│  → Highest bid wins                                      │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  BULBUL OUTBOUND CONFIRMATION CALL                       │
│  → Calls farmer via Twilio + Sarvam TTS (Bulbul)         │
│  → Farmer presses 1 to accept / 2 to decline             │
│  → Payment acknowledgment → Trust score updates          │
└──────────────────────────────────────────────────────────┘
```

## How To Run Locally
1. Clone repo
2. `pip install -r requirements.txt`
3. `npm install` (in `frontend/`)
4. Copy `.env.example` to `.env` and fill:
   `SARVAM_API_KEY`, `DATABASE_URL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `PUBLIC_URL`, `NEXT_PUBLIC_BACKEND_URL`
5. `alembic upgrade head`
6. `uvicorn app:app --reload` (in `backend/`)
7. `npm run dev` (in `frontend/`)
8. Set Twilio webhook to `PUBLIC_URL/inbound-call`

## Deployment
- Frontend: Vercel (auto-deploy on push)
- Backend: Render (auto-deploy on push)
- Database: Render PostgreSQL
- Keep-alive: Backend kept alive via UptimeRobot health check pings every 5 minutes to prevent cold starts on Render free tier.

## Demo Video
[Demo Video](https://youtu.be/7IdrgZnNTSE?si=u5f-Xh8RoBJlLfbQ)

## Team
- Mandi Mitra Team
