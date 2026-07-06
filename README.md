# Mandi Mitra

### Tagline: FPO-level bargaining power for every farmer via a phone call.

Mandi Mitra is a voice-driven, regional-language crop pooling and live auction platform designed for small-scale Indian farmers. It removes the barrier of smartphones, internet access, and literacy, enabling any farmer to participate in collective bargaining by simply placing a local phone call.

---

## Problem
India's 120+ million smallholder farmers typically sell their produce individually to local middle-men far below market value. They face:
- **No Bargaining Power:** Small quantities (e.g., 100-200 kg) do not justify transporting goods to central markets or negotiating prices.
- **Digital Exclusion:** Existing agricultural e-commerce portals require smartphone ownership, stable internet, and digital literacy.
- **High Transaction Overhead:** Individual transport and storage costs eat away thin profit margins.

---

## Solution
Mandi Mitra enables farmers to call a dedicated phone number, describe their produce in their native language (Hindi, Tamil, Telugu, Kannada, English), and get dynamically grouped into localized FPO-level crop pools.
1. **Pledge via Voice:** Farmers speak naturally to list their name, crop, quantity, and location.
2. **Dynamic Pooling:** The system aggregates individual crop pledges until a minimum shipping threshold is reached (e.g. 250 kg).
3. **Live Auctions:** Once the threshold is met, the pool closes, and a live, competitive SMS-driven auction triggers for registered buyers.
4. **Cascade Settlement:** The highest bidder wins, and the platform transparently allocates earnings to farmers on a First-Come, First-Served (FCFS) basis.

---

## Sarvam AI Integration
Sarvam AI powers the entire farmer-facing voice interface, serving as the core entry point of the platform:
- **Sarvam Saaras STT:** Transcribes spoken farmer audio (in regional languages/dialects) to text.
- **Sarvam LLM (sarvam-2):** Conversational NLP understands natural, unstructured speech to extract:
  1. Farmer Name
  2. Crop Name
  3. Quantity (in kilograms)
  4. Village / Location
- **Sarvam TTS:** Speaks back the confirmation details in the farmer's native tongue before finalizing the database transaction.

No Sarvam call = no pool = no auction. Sarvam is the foundational entry point of the entire application.

---

## Tech Stack

### Frontend Table
| Technology | Usage |
| :--- | :--- |
| **Next.js 14** | Application Framework |
| **React 18** | UI Components |
| **TailwindCSS** | Sleek Glassmorphism Styling |
| **Zustand** | State Management |
| **Socket.io-client** | Real-time WebSocket Updates |
| **Leaflet / React Leaflet** | Geographic Mapping of Pools |

### Backend Table
| Technology | Usage |
| :--- | :--- |
| **FastAPI** | High-performance Python APIs |
| **SQLAlchemy** | SQL Toolkit and Object-Relational Mapper |
| **PostgreSQL** | Production-Grade Concurrent Database |
| **Alembic** | Database Migrations |
| **APScheduler** | Background Cron for Auction Expiry checks |
| **Twilio SDK** | Inbound TwiML voice integration |

---

## Architecture

```
[Farmer Inbound Call]
         │
         ▼
 ┌───────────────┐        ┌───────────────┐
 │  Twilio Voice │───────▶│   FastAPI     │
 └───────────────┘        │ (Voice Layer) │
                          └───────────────┘
                                  │
      ┌───────────────────────────┴───────────────────────────┐
      ▼                                                       ▼
┌───────────────┐                                       ┌───────────────┐
│   Sarvam AI   │                                       │   FastAPI     │
│ (STT/LLM/TTS) │                                       │ (Core Engine) │
└───────────────┘                                       └───────────────┘
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            ▼                                   ▼
                                    ┌───────────────┐                   ┌───────────────┐
                                    │  PostgreSQL   │                   │ Next.js WebUI │
                                    └───────────────┘                   └───────────────┘
```

---

## How To Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL server

### Steps
1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd flowzint-new
   ```

2. **Backend Setup:**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up Environment variables
   cp .env.example .env
   # Edit .env and configure SARVAM_API_KEY, DATABASE_URL, BASE_URL, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
   ```

3. **Database Migration:**
   ```bash
   # Initialize and apply database migrations
   alembic init alembic
   alembic revision --autogenerate -m "initial"
   alembic upgrade head
   ```

4. **Start Backend Server:**
   ```bash
   uvicorn backend.app:app --reload --port 8000
   ```

5. **Start Voice Layer Server:**
   ```bash
   uvicorn main:app --reload --port 5000
   ```

6. **Expose Voice Layer via ngrok:**
   ```bash
   ngrok http 5000
   # Copy the HTTPS URL and update BASE_URL in your .env
   # Set your Twilio phone number webhook to: https://your-ngrok-url/inbound-call
   ```

7. **Frontend Setup & Run:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Demo Video
[Link to Hackathon Submission Video](https://youtube.com/demo-link-here)

---

## Team
- **AgriTech Pioneers Team**
