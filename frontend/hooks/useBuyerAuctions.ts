"use client";

import { useQuery } from "@tanstack/react-query";
import { buyerApi } from "@/lib/buyerApi";
import { AuctionPool } from "@/types";

export function useBuyerAuctions() {
  return useQuery({
    queryKey: ["buyer", "auctions"],
    queryFn: async (): Promise<{ data: AuctionPool[]; offline: boolean }> => {
      return buyerApi.getActivePools();
    },
    refetchInterval: 5_000,
    staleTime: 3_000,
    retry: false, // Don't retry — fall back to mock data immediately
  });
}
