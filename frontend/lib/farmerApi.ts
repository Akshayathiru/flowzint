const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || `API error ${res.status}`)
  }
  return res.json()
}

export const farmerApi = {
  getProfile: (phone: string) =>
    request<{
      phone: string;
      name: string | null;
      location: string;
      primary_crop: string;
      trust_score: number;
      total_calls: number;
      total_pools: number;
      total_quantity_kg: number;
      total_earnings: number;
      member_since: string;
    }>(`/farmer/${encodeURIComponent(phone)}`),

  getPools: (phone: string) =>
    request<Array<{
      pool_id: number;
      crop: string;
      location: string;
      status: string;
      current_qty_kg: number;
      target_qty_kg: number;
      farmers_count: number;
      your_contribution_kg: number;
      settled_price_per_kg: number | null;
      mandi_rate_per_kg: number | null;
    }>>(`/farmer/${encodeURIComponent(phone)}/pools`),

  getSettlements: (phone: string) =>
    request<Array<{
      pool_id: number;
      crop: string;
      location: string;
      your_quantity_kg: number;
      price_per_kg: number;
      mandi_rate_per_kg: number;
      total_amount: number;
      premium_percent: number;
      buyers: string;
      settled_at: string;
    }>>(`/farmer/${encodeURIComponent(phone)}/settlements`),

  getCalls: (phone: string) =>
    request<Array<{
      call_id: number;
      timestamp: string;
      crop: string;
      quantity_kg: number;
      location: string;
      language: string;
      pool_id: number | null;
      status: string;
    }>>(`/farmer/${encodeURIComponent(phone)}/calls`),

  getPoolFarmers: (poolId: number) =>
    request<Array<{
      phone: string;
      quantity_kg: number;
      trust_score: number;
      call_time: string;
      language: string;
    }>>(`/pool/${poolId}/farmers`),
}
