const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error ${res.status}: ${error}`);
  }
  return res.json();
}

export const api = {
  pools: {
    getActive: () => request("/api/pools/active"),
    getById: (id: string) => request(`/api/pools/${id}`),
    close: (poolId: string) =>
      request("/api/demo/close-pool", {
        method: "POST",
        body: JSON.stringify({ poolId }),
      }),
  },
  buyers: {
    getAll: () => request("/api/buyers"),
    register: (data: unknown) =>
      request("/api/buyers", { method: "POST", body: JSON.stringify(data) }),
    checkPhone: (phone: string) => request(`/api/buyers/check?phone=${phone}`),
  },
  farmers: {
    getAll: () => request("/api/farmers"),
    getByPhone: (phone: string) =>
      request(`/api/farmers/${encodeURIComponent(phone)}`),
  },
  settlements: {
    getAll: (params?: Record<string, string>) =>
      request(`/api/settlements?${new URLSearchParams(params)}`),
    export: () => request("/api/settlements/export"),
  },
  demo: {
    triggerCall: (data: {
      phone: string;
      crop: string;
      qtyKg: number;
      language: string;
    }) =>
      request("/api/demo/trigger-call", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    injectBid: (data: {
      poolId: string;
      buyerName: string;
      pricePerKg: number;
    }) =>
      request("/api/demo/inject-bid", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    closePool: (poolId: string) =>
      request("/api/demo/close-pool", {
        method: "POST",
        body: JSON.stringify({ poolId }),
      }),
    sendCallbacks: (poolId: string) =>
      request("/api/demo/send-callbacks", {
        method: "POST",
        body: JSON.stringify({ poolId }),
      }),
  },
};
