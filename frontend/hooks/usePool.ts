"use client";

import { useQuery } from "@tanstack/react-query";
import { ActivePool } from "@/types";

async function fetchPool(poolId: string): Promise<ActivePool> {
  const res = await fetch(`/api/pools/${poolId}`);
  if (!res.ok) throw new Error("Failed to fetch pool");
  return res.json();
}

export function usePool(poolId: string) {
  return useQuery({
    queryKey: ["pool", poolId],
    queryFn: () => fetchPool(poolId),
    refetchInterval: 5_000,
    staleTime: 3_000,
    enabled: !!poolId,
  });
}
