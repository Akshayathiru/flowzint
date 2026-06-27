import { create } from "zustand";
import { ActivePool, FarmerEntry, BuyerBid } from "@/types";

interface PoolStore {
  pools: ActivePool[];
  selectedPoolId: string | null;
  setPools: (pools: ActivePool[]) => void;
  setSelectedPool: (id: string | null) => void;
  updatePool: (poolId: string, updates: Partial<ActivePool>) => void;
  addPool: (pool: ActivePool) => void;
  addFarmerToPool: (poolId: string, farmer: FarmerEntry) => void;
  receiveBid: (poolId: string, bid: BuyerBid) => void;
  closePool: (poolId: string, winningBid: BuyerBid) => void;
}

export const usePoolStore = create<PoolStore>((set) => ({
  pools: [],
  selectedPoolId: null,

  setPools: (pools) => set({ pools }),

  setSelectedPool: (id) => set({ selectedPoolId: id }),

  updatePool: (poolId, updates) =>
    set((state) => ({
      pools: state.pools.map((p) =>
        p.poolId === poolId ? { ...p, ...updates } : p
      ),
    })),

  addPool: (pool) => set((state) => ({ pools: [...state.pools, pool] })),

  addFarmerToPool: (poolId, farmer) =>
    set((state) => ({
      pools: state.pools.map((p) =>
        p.poolId === poolId
          ? {
              ...p,
              farmersCount: p.farmersCount + 1,
              currentQtyKg: p.currentQtyKg + farmer.qtyKg,
            }
          : p
      ),
    })),

  receiveBid: (poolId, bid) =>
    set((state) => ({
      pools: state.pools.map((p) =>
        p.poolId === poolId ? { ...p, status: "auctioning" as const } : p
      ),
    })),

  closePool: (poolId, winningBid) =>
    set((state) => ({
      pools: state.pools.map((p) =>
        p.poolId === poolId ? { ...p, status: "settled" as const } : p
      ),
    })),
}));
