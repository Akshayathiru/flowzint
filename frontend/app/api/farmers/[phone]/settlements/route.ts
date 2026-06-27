import { NextResponse } from 'next/server'

// TODO: proxy to FastAPI GET /api/farmers/:phone/settlements
export async function GET(_req: Request, { params }: { params: { phone: string } }) {
  const { phone } = params;
  return NextResponse.json([
    { poolId: "KAN-TOM-001", date: "2024-01-15", crop: "Tomatoes", district: "Kanchipuram", qtyKg: 200, pricePerKg: 15, totalEarnings: 3000, premiumPct: 25, phone },
    { poolId: "CHE-POT-003", date: "2024-01-14", crop: "Potatoes", district: "Chengalpattu", qtyKg: 180, pricePerKg: 21, totalEarnings: 3780, premiumPct: 17, phone }
  ])
}
