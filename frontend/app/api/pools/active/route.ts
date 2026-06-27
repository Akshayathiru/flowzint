import { NextResponse } from "next/server";

// TODO: proxy to process.env.BACKEND_URL/api/pools/active
export async function GET() {
  return NextResponse.json([
    {
      poolId: "KAN-TOM-001",
      crop: "Tomatoes",
      location: "Kanchipuram",
      currentQtyKg: 820,
      targetQtyKg: 1000,
      farmersCount: 6,
      minutesRemaining: 47,
      status: "filling",
      geoCenter: [12.8342, 79.7036],
    },
    {
      poolId: "VEL-ONI-002",
      crop: "Onions",
      location: "Vellore",
      currentQtyKg: 312,
      targetQtyKg: 500,
      farmersCount: 4,
      minutesRemaining: 61,
      status: "auctioning",
      geoCenter: [12.9165, 79.1325],
    },
  ]);
}
