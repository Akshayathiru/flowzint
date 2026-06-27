"use client";

import { useQuery } from "@tanstack/react-query";
import { ActivePool } from "@/types";

async function fetchActivePools(): Promise<ActivePool[]> {
  const res = await fetch("/api/pools/active");
  if (!res.ok) throw new Error("Failed to fetch pools");
  return res.json();
}

export function usePools() {
  return useQuery({
    queryKey: ["pools", "active"],
    queryFn: fetchActivePools,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}
