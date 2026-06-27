# Integration Audit Report: Frontend & Backend Integration

This document outlines the architectural mismatches, missing endpoints, data schema conflicts, and code bugs identified when connecting the Next.js frontend and the FastAPI backend.

---

## 1. Syntax and Schema Bugs in Backend Code

Before starting the integration, the following critical bugs in the backend schemas must be resolved:

### A. Indentation Bug in `backend/schemas.py`
In [schemas.py](file:///c:/Users/Admin/OneDrive/Desktop/flowzint-new/backend/schemas.py#L27-L32), the `BuyerCreate` model is incorrectly nested inside the `PoolResponse` model because of an extra indentation level. This will prevent `BuyerCreate` from being imported or used as a standalone model.

```diff
 class PoolResponse(BaseModel):
     id: int
     crop: str
     location: str
     total_quantity: float
     status: str

-    class BuyerCreate(BaseModel):
-        name: str
-        phone: str
-        crop: str
-        location: str
-        min_quantity: float
+class BuyerCreate(BaseModel):
+    name: str
+    phone: str
+    crop: str
+    location: str
+    min_quantity: float
```

### B. Duplicate `OfferCreate` Definition in `backend/schemas.py`
The `OfferCreate` model is defined twice: on [lines 13-17](file:///c:/Users/Admin/OneDrive/Desktop/flowzint-new/backend/schemas.py#L13-L17) and again on [lines 34-38](file:///c:/Users/Admin/OneDrive/Desktop/flowzint-new/backend/schemas.py#L34-L38). The duplicate should be removed to avoid confusion.

---

## 2. API Endpoint Mismatches

The frontend expects specific endpoint paths and request formats under `/api/*` in the Next.js API routes, whereas the FastAPI backend uses different paths and schema structures.

| Feature / Action | Frontend Expectation ([api.ts](file:///c:/Users/Admin/OneDrive/Desktop/flowzint-new/frontend/lib/api.ts)) | FastAPI Backend Implementation | Mismatch / Missing Details |
| :--- | :--- | :--- | :--- |
| **Get Active Pools** | `GET /api/pools/active` | *None* | **Missing**. Backend only has `pool_summary/{pool_id}`. Needs a new query to fetch all open/active pools. |
| **Get Pool Details** | `GET /api/pools/{poolId}` | `GET /pool_summary/{pool_id}` | **Path & ID mismatch**. Backend expects integer ID and path `/pool_summary/{id}` instead of `/pools/{id}`. |
| **Close Pool** | `POST /api/demo/close-pool`<br>Body: `{ "poolId": string }` | `POST /close_pool/{pool_id}` | **Payload vs Path mismatch**. Backend uses path parameter `pool_id` (integer) instead of JSON payload. |
| **Submit Buyer Bid** | `POST /api/demo/inject-bid`<br>Body: `{ "poolId": string, "buyerName": string, "pricePerKg": number }` | `POST /buyer_offer`<br>Body: `OfferCreate` | **Schema mismatch**. Backend expects `buyer_id` and `pool_id` (integers), whereas frontend sends names. |
| **Get All Buyers** | `GET /api/buyers` | `GET /buyers` | **Path mismatch**. (FastAPI has `/buyers` instead of `/api/buyers`). |
| **Get All Farmers** | `GET /api/farmers` | *None* | **Missing**. FastAPI has `/add_farmer` and `/trust_score/{phone}` but no list endpoint. |
| **Get Settlements** | `GET /api/settlements` | *None* | **Missing**. FastAPI only has a `/receipt/{pool_id}/{phone}` detail endpoint. |
| **Get Stats / Counters** | `GET /api/stats` | *None* | **Missing**. No dashboard summary endpoint exists on the backend. |

---

## 3. Real-Time Communication (WebSockets) Mismatch

The frontend utilizes WebSocket connections to retrieve live notifications and event streams.

*   **Frontend implementation:** [socket.ts](file:///c:/Users/Admin/OneDrive/Desktop/flowzint-new/frontend/lib/socket.ts#L7) attempts to connect to `ws://localhost:8000`.
*   **Voice Layer Backend (`main.py`):** Runs on port 8000 but **does not have any WebSocket or Socket.io handlers**. It is a pure HTTP FastAPI application.
*   **Result:** The frontend will repeatedly throw WebSocket connection errors in the console and fail to render live feed logs.
*   **Resolution:** Implement a FastAPI WebSocket router or integrate `python-socketio` into the FastAPI instance running on port 8000 (or proxy it).

---

## 4. Recommended Integration Strategy

To connect the Next.js frontend with the Python backends cleanly, we recommend implementing **Next.js API Route Proxies**:

```mermaid
graph TD
    Browser[Browser / React Frontend] -->|Calls /api/*| NextJS[Next.js API Routes (Port 3000)]
    NextJS -->|Proxies to Port 8001| FastAPI_Backend[FastAPI Backend Engine]
    NextJS -->|Proxies to Port 8000| FastAPI_Voice[Voice & Language Layer]
    FastAPI_Backend -->|Queries| SQLite[(mandi.db)]
```

### Why this is the best approach:
1.  **CORS issues are avoided:** The browser only talks to Port 3000, preventing Cross-Origin Resource Sharing (CORS) blockages.
2.  **Payload & URL translation:** Next.js API routes can act as a lightweight middleware layer. For example, converting frontend string IDs to integer IDs, or fetching the `buyer_id` from a buyer's name before sending the bid to FastAPI.
3.  **Authentication/Middleware:** You can intercept requests to handle session tokens before calling the backends.

---

## 5. Next Steps / Action Items

To start connecting them, we should:
1.  Fix the indentation bug in [schemas.py](file:///c:/Users/Admin/OneDrive/Desktop/flowzint-new/backend/schemas.py).
2.  Add missing retrieval endpoints (like `GET /pools/active` and `GET /stats`) to the FastAPI backend.
3.  Write proxy handlers in Next.js routes (e.g., `frontend/app/api/pools/active/route.ts`) to query FastAPI on port 8001 instead of returning mock data.
