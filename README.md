# Mandi Mitra — मंडी मित्र
### AI-Orchestrated Crop Pooling & Live Auction Platform

> _"An FPO takes six months. We do it in ninety minutes — with one phone call."_

---

## The Problem

120 million smallholder farmers in India have zero bargaining power. They sell at whatever price the local trader offers. Forming a Farmer Producer Organization (FPO) takes months of paperwork most will never complete. Most farmers can't read. Most don't have smartphones.

## The Solution

A voice-first platform where farmers call a number, speak their crop and quantity in their language, and get pooled with nearby farmers for collective bargaining power. A live auction finds the best buyer. Everyone gets called back with a verified price.

**No app. No literacy. No smartphone. Just a phone call.**

---

## How It Works

```
Farmer calls → Saaras STT → Sarvam-2 LLM → Pooling Engine → Live Auction → Bulbul TTS Callback
```

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│  FARMER CALLS (Twilio + Sarvam Saaras v2.5)             │
│  "80 kilo tomato, Kanchipuram"                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  SARVAM-2 LLM — Structured Data Extraction              │
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
│  LIVE AUCTION ENGINE                                     │
│  → Notifies registered buyers                            │
│  → Accepts bids with atomic locking + anti-sniping       │
│  → Highest bid wins                                      │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  SETTLEMENT CALLBACK (Sarvam Bulbul v3 TTS)             │
│  → Calls every farmer in their language                  │
│  → "Your tomatoes sold at ₹17/kg — 25% above market"   │
└──────────────────────────────────────────────────────────┘
```

---

## Sarvam AI Integration

Sarvam is not optional — it IS the product. Without Sarvam, this requires an app, literacy, and a smartphone.

| Component | Role | Model |
|-----------|------|-------|
| **Saaras v2.5** | Speech-to-text for farmer IVR calls | `saaras:v2.5` |
| **Sarvam-2 LLM** | Structured data extraction from voice | `sarvam-2` |
| **Bulbul v3** | Text-to-speech settlement callbacks | `bulbul:v3` |

Languages supported: Tamil, Hindi, Telugu, Kannada, Marathi, English

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query, Recharts, Leaflet, next-intl (6 languages) |
| **Core Backend** | FastAPI, SQLAlchemy, SQLite, APScheduler, Socket.IO |
| **Voice Layer** | FastAPI, Twilio, Sarvam AI (Saaras + Sarvam-2 + Bulbul) |
| **Database** | SQLite (dev) / PostgreSQL (prod) |

---

## Three Role-Based Portals

### Farmer Portal
- Dashboard with active pools, earnings, trust score
- Earnings analytics with price vs mandi rate charts
- Settlement receipts (downloadable)
- 6-language support (switch mid-session)

### Buyer Portal
- Live auctions with real-time countdown timers
- Bid submission with atomic locking
- Portfolio analytics
- Pool detail with farmer transparency

### Admin Dashboard
- Real-time pool monitoring (3-second polling)
- Farmer and buyer registries
- Settlement archive
- Catchment area maps

---

## Trust Score System

- Farmers start at 100 points (5.0 stars)
- Successful delivery: +5 points (capped at +2 for < 50kg to prevent gaming)
- No-show penalty: up to -20 points, proportional to undelivered quantity
- Buyers: 3 no-shows = auto-suspension

---

## Running Locally

```bash
# 1. Voice & Language Layer
cd flowzint
python -m uvicorn main:app --port 8000

# 2. Core Backend Engine
cd flowzint/backend
python -m uvicorn app:app --port 8001

# 3. Frontend
cd flowzint/frontend
npm install && npm run dev
```

### Environment Variables

```bash
# flowzint/.env
SARVAM_API_KEY=<your key>
MOCK_MODE=false
DATABASE_URL=sqlite:///path/to/mandi.db
TWILIO_ACCOUNT_SID=<your sid>
TWILIO_AUTH_TOKEN=<your token>
TWILIO_PHONE_NUMBER=<your number>
PUBLIC_URL=<ngrok https URL>

# flowzint/frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/active` | Active pools |
| `GET` | `/farmer/{phone}` | Farmer profile |
| `GET` | `/farmer/{phone}/pools` | Farmer's pools |
| `GET` | `/farmer/{phone}/settlements` | Farmer settlements |
| `GET` | `/farmer/{phone}/calls` | Call history |
| `GET` | `/pool/{pool_id}/farmers` | Farmers in pool |
| `POST` | `/add_buyer` | Register buyer |
| `GET` | `/buyers` | All buyers |
| `POST` | `/buyer_offer` | Submit bid |
| `GET` | `/receipt/{pool_id}/{phone}` | Settlement receipt |

---

## Demo

[Demo Video](https://youtu.be/7IdrgZnNTSE?si=u5f-Xh8RoBJlLfbQ)

---

## Built for HACKHAZARDS '26

Theme: 🌍 Climate & Sustainability Systems
Track: Sarvam AI — Best use of Sarvam AI

---

## Team
- Samiksha — Frontend
- Akshaya — Backend
- Samfrancis — Sarvam AI and calls
