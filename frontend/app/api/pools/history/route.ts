import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

// TODO: proxy to FastAPI GET /api/pools/history?page=&limit=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  return NextResponse.json({
    pools: [
      { id: "KAN-TOM-001", crop: "Tomatoes", district: "Kanchipuram", currentQtyKg: 1020, targetQtyKg: 1000, farmersCount: 6, status: "settled", openedAt: "2024-01-15T09:00:00Z", closedAt: "2024-01-15T09:45:00Z", mandiAvgPricePerKg: 12, winningBidPerKg: 15 },
      { id: "VEL-ONI-002", crop: "Onions", district: "Vellore", currentQtyKg: 640, targetQtyKg: 500, farmersCount: 4, status: "settled", openedAt: "2024-01-15T10:00:00Z", closedAt: "2024-01-15T10:38:00Z", mandiAvgPricePerKg: 22, winningBidPerKg: 26 },
      { id: "TIR-TOM-007", crop: "Tomatoes", district: "Tiruvannamalai", currentQtyKg: 90, targetQtyKg: 500, farmersCount: 2, status: "expired", openedAt: "2024-01-13T11:00:00Z", closedAt: "2024-01-13T12:30:00Z", mandiAvgPricePerKg: 12, winningBidPerKg: null },
      { id: "CHE-POT-003", crop: "Potatoes", district: "Chengalpattu", currentQtyKg: 880, targetQtyKg: 800, farmersCount: 5, status: "settled", openedAt: "2024-01-14T08:30:00Z", closedAt: "2024-01-14T09:15:00Z", mandiAvgPricePerKg: 18, winningBidPerKg: 21 }
    ],
    pagination: { page, limit, total: 4, totalPages: 1 }
  })
}
