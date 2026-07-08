import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    // Settled pools from backend — these represent "history"
    const res = await fetch(`${BACKEND_URL}/settlements`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Backend error: ${res.status}`)
    const allPools = await res.json()

    const pools = Array.isArray(allPools) ? allPools : []
    const total = pools.length
    const totalPages = Math.ceil(total / limit)
    const paginated = pools.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      pools: paginated,
      pagination: { page, limit, total, totalPages }
    })
  } catch (error) {
    console.error('Failed to fetch pool history from backend:', error)
    // Graceful fallback with static demo data
    return NextResponse.json({
      pools: [
        { poolId: 'KAN-TOM-001', crop: 'Tomatoes', location: 'Kanchipuram', totalQtyKg: 1020, farmersCount: 6, winningPricePerKg: 15, buyerName: 'Ravi Traders', settledAt: '2024-01-15T09:45:00Z', status: 'settled' },
        { poolId: 'VEL-ONI-002', crop: 'Onions', location: 'Vellore', totalQtyKg: 640, farmersCount: 4, winningPricePerKg: 26, buyerName: 'FreshMart Ltd', settledAt: '2024-01-15T10:38:00Z', status: 'settled' },
        { poolId: 'CHE-POT-003', crop: 'Potatoes', location: 'Chengalpattu', totalQtyKg: 880, farmersCount: 5, winningPricePerKg: 21, buyerName: 'Agro Exports', settledAt: '2024-01-14T09:15:00Z', status: 'settled' },
      ],
      pagination: { page, limit, total: 3, totalPages: 1 }
    })
  }
}
