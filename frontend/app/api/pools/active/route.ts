import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

const mockPools = [
  {
    poolId: "KAN-TOM-001",
    crop: "Tomatoes",
    location: "Kanchipuram",
    currentQtyKg: 820,
    targetQtyKg: 1000,
    farmersCount: 6,
    minutesRemaining: 47,
    status: "filling" as const,
    geoCenter: [12.8342, 79.7036] as [number, number],
  },
  {
    poolId: "VEL-ONI-002",
    crop: "Onions",
    location: "Vellore",
    currentQtyKg: 312,
    targetQtyKg: 500,
    farmersCount: 4,
    minutesRemaining: 61,
    status: "auctioning" as const,
    geoCenter: [12.9165, 79.1325] as [number, number],
  },
];

function getGeoCenter(location: string): [number, number] {
  const loc = location.toLowerCase();
  if (loc.includes("vellore")) return [12.9165, 79.1325];
  if (loc.includes("salem")) return [11.6643, 78.1460];
  if (loc.includes("krishnagiri")) return [12.5186, 78.2138];
  if (loc.includes("chengalpattu")) return [12.6841, 79.9836];
  if (loc.includes("tiruvannamalai")) return [12.2280, 79.0667];
  return [12.8342, 79.7036]; // default Kanchipuram
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/active`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }
    const data = await res.json();
    if ((!data || data.length === 0) && process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      return NextResponse.json(mockPools);
    }
    
    // Map backend output to ActivePool structure
    const pools = data.map((pool: {
      poolId?: string | number;
      id?: string | number;
      crop?: string;
      location?: string;
      currentQtyKg?: number;
      total_quantity?: number;
      targetQtyKg?: number;
      farmersCount?: number;
      minutesRemaining?: number;
      status?: "filling" | "closed" | "auctioning" | "settled" | "expired";
      geoCenter?: [number, number];
    }) => ({
      poolId: String(pool.poolId || pool.id),
      crop: pool.crop || "",
      location: pool.location || "",
      currentQtyKg: Number(pool.currentQtyKg || pool.total_quantity || 0),
      targetQtyKg: Number(pool.targetQtyKg || 250.0),
      farmersCount: Number(pool.farmersCount || 0),
      minutesRemaining: Number(pool.minutesRemaining ?? 45),
      status: pool.status || "filling",
      geoCenter: pool.geoCenter || getGeoCenter(pool.location || ""),
    }));

    return NextResponse.json(pools);
  } catch (error) {
    console.error("Failed to fetch active pools from backend:", error);
    return NextResponse.json(mockPools);
  }
}

