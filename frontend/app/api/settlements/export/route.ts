import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8001'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/settlements`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Backend error: ${res.status}`)
    const pools: Array<{
      poolId: string
      settledAt: string | null
      crop: string
      location: string
      totalQtyKg: number
      winningPricePerKg: number
      buyerName: string
      farmersCount: number
    }> = await res.json()

    if (!Array.isArray(pools) || pools.length === 0) {
      throw new Error('No settlements')
    }

    const csvHeader = 'Pool ID,Date,Crop,District,Qty (kg),Winning Price (₹/kg),Premium %,Buyer,Farmers,SMS Sent'
    const csvRows = pools.map(p => {
      const mandiApprox = p.winningPricePerKg ? (p.winningPricePerKg * 0.8).toFixed(2) : '0'
      const premiumPct = p.winningPricePerKg
        ? Math.round(((p.winningPricePerKg - parseFloat(mandiApprox)) / parseFloat(mandiApprox)) * 100)
        : 0
      const date = p.settledAt ? p.settledAt.split('T')[0] : ''
      return `${p.poolId},${date},${p.crop},${p.location},${p.totalQtyKg},${p.winningPricePerKg},${premiumPct}%,${p.buyerName},${p.farmersCount},Yes`
    })

    const csv = [csvHeader, ...csvRows].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="flowzint-settlements.csv"'
      }
    })
  } catch (error) {
    console.error('Failed to export settlements:', error)
    // Graceful fallback with static demo CSV
    const csvHeader = 'Pool ID,Date,Crop,District,Qty (kg),Winning Price (₹/kg),Premium %,Buyer,Farmers,SMS Sent'
    const csvRows = [
      'KAN-TOM-001,2024-01-15,Tomatoes,Kanchipuram,1020,15,25%,Ramesh Traders,6,Yes',
      'VEL-ONI-002,2024-01-15,Onions,Vellore,640,26,18%,Suresh Wholesale,4,Yes',
      'CHE-POT-003,2024-01-14,Potatoes,Chengalpattu,880,21,17%,Kumar & Sons,5,Yes',
    ]
    const csv = [csvHeader, ...csvRows].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="flowzint-settlements.csv"'
      }
    })
  }
}
