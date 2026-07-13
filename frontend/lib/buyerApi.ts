import { BuyerProfile, AuctionPool } from "@/types";
import { MOCK_BUYERS, MOCK_AUCTION_POOLS, MOCK_POOL_FARMERS } from "./buyerMockData";

const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const BASE = rawBase.trim().replace(/\n/g, "").replace(/\r/g, "");

let _isOffline = false;
export function isBackendOffline() {
  return _isOffline;
}

export interface ClosePoolAllocation {
  buyer_id: number;
  allocated_quantity: number;
  price: number;
}

export interface ClosePoolResponse {
  pool_id: number;
  status: string;
  allocations: ClosePoolAllocation[];
}

export interface ReceiptResponse {
  pool_id: number;
  crop: string;
  location: string;
  farmer_phone: string;
  quantity: number;
  average_price_per_kg: number;
  total_amount: number;
  buyers: string;
  status: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error ${res.status}`);
  }
  _isOffline = false;
  return res.json();
}

export const buyerApi = {
  getAll: async (): Promise<{ data: BuyerProfile[]; offline: boolean }> => {
    try {
      const data = await request<BuyerProfile[]>("/buyers");
      _isOffline = false;
      return { data, offline: false };
    } catch {
      _isOffline = true;
      return { data: MOCK_BUYERS, offline: true };
    }
  },

  getActivePools: async (): Promise<{ data: AuctionPool[]; offline: boolean }> => {
    try {
      const data = await request<any[]>("/active");
      const mappedData: AuctionPool[] = data.map((p: any) => ({
        pool_id: p.pool_id !== undefined ? p.pool_id : parseInt(p.poolId),
        crop: p.crop,
        location: p.location,
        current_qty_kg: p.current_qty_kg !== undefined ? p.current_qty_kg : p.currentQtyKg,
        target_qty_kg: p.target_qty_kg !== undefined ? p.target_qty_kg : p.targetQtyKg,
        farmers_count: p.farmers_count !== undefined ? p.farmers_count : p.farmersCount,
        status: p.status,
        auctionEndTime: p.auctionEndTime,
        auctionClosed: p.auctionClosed,
      }));
      _isOffline = false;
      return { data: mappedData, offline: false };
    } catch {
      _isOffline = true;
      return { data: MOCK_AUCTION_POOLS, offline: true };
    }
  },

  register: async (payload: {
    name: string;
    phone: string;
    crop: string;
    location: string;
    min_quantity: number;
  }): Promise<{ data: { message: string; buyer_id: number }; offline: boolean }> => {
    try {
      const data = await request<{ message: string; buyer_id: number }>("/add_buyer", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      _isOffline = false;
      return { data, offline: false };
    } catch {
      _isOffline = true;
      return {
        data: {
          message: "Buyer created (demo mode)",
          buyer_id: Math.floor(Math.random() * 900) + 100,
        },
        offline: true,
      };
    }
  },

  submitBid: async (payload: {
    buyer_id: number;
    pool_id: number;
    price: number;
    quantity: number;
  }): Promise<{ data: { message: string }; offline: boolean }> => {
    try {
      const data = await request<{ message: string }>("/buyer_offer", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      _isOffline = false;
      return { data, offline: false };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("closed") || message.includes("expired")) {
        throw err;
      }
      _isOffline = true;
      return {
        data: { message: "Bid accepted (demo mode)" },
        offline: true,
      };
    }
  },

  closePool: async (poolId: number): Promise<{ data: ClosePoolResponse; offline: boolean }> => {
    try {
      const data = await request<ClosePoolResponse>(`/close_pool/${poolId}`, { method: "POST" });
      _isOffline = false;
      return { data, offline: false };
    } catch {
      _isOffline = true;
      return {
        data: {
          pool_id: poolId,
          status: "SETTLED",
          allocations: [{ buyer_id: 1, allocated_quantity: 500, price: 15.0 }],
        },
        offline: true,
      };
    }
  },

  getReceipt: async (poolId: number, phone: string): Promise<{ data: ReceiptResponse; offline: boolean }> => {
    try {
      const data = await request<ReceiptResponse>(`/receipt/${poolId}/${phone}`);
      _isOffline = false;
      return { data, offline: false };
    } catch {
      _isOffline = true;
      return {
        data: {
          pool_id: poolId,
          crop: "tomato",
          location: "kanchipuram",
          farmer_phone: phone,
          quantity: 100,
          average_price_per_kg: 15.5,
          total_amount: 1550,
          buyers: "Ramesh Traders",
          status: "SETTLED",
        },
        offline: true,
      };
    }
  },

  getPoolFarmers: async (poolId: number) => {
    try {
      const data = await request<any[]>(`/pool/${poolId}/farmers`)
      return { data, offline: false }
    } catch {
      return { data: MOCK_POOL_FARMERS[poolId] || [], offline: true }
    }
  },
};
