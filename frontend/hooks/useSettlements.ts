"use client";

import { useQuery } from "@tanstack/react-query";

interface SettlementSearchParams {
  from?: string;
  to?: string;
  crop?: string;
  district?: string;
}

async function fetchSettlements(params: SettlementSearchParams) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val) {
      queryParams.append(key, val);
    }
  });

  const res = await fetch(`/api/settlements?${queryParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch settlements");
  return res.json();
}

export function useSettlements(params: SettlementSearchParams = {}) {
  return useQuery({
    queryKey: ["settlements", params],
    queryFn: () => fetchSettlements(params),
    staleTime: 15_000,
  });
}
