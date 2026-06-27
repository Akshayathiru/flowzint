"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchBuyers() {
  const res = await fetch("/api/buyers");
  if (!res.ok) throw new Error("Failed to fetch buyers");
  return res.json();
}

export function useBuyers() {
  return useQuery({
    queryKey: ["buyers"],
    queryFn: fetchBuyers,
    staleTime: 30_000,
  });
}
