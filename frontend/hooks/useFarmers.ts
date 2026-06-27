"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchFarmers() {
  const res = await fetch("/api/farmers");
  if (!res.ok) throw new Error("Failed to fetch farmers");
  return res.json();
}

export function useFarmers() {
  return useQuery({
    queryKey: ["farmers"],
    queryFn: fetchFarmers,
    staleTime: 20_000,
  });
}
