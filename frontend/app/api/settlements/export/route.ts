import { NextResponse } from 'next/server'

// TODO: proxy to FastAPI GET /api/settlements/export
export async function GET() {
  const csvHeader = 'Pool ID,Date,Crop,District,Qty (kg),Winning Price (₹/kg),Premium %,Buyer,Farmers,SMS Sent'
  const csvRows = [
    'KAN-TOM-001,2024-01-15,Tomatoes,Kanchipuram,1020,15,25%,Ramesh Traders,6,Yes',
    'VEL-ONI-002,2024-01-15,Onions,Vellore,640,26,18%,Suresh Wholesale,4,Yes',
    'CHE-POT-003,2024-01-14,Potatoes,Chengalpattu,880,21,17%,Kumar & Sons,5,Yes',
    'TIR-TOM-007,2024-01-13,Tomatoes,Tiruvannamalai,90,-,-,Pool Expired,2,Yes'
  ]
  const csv = [csvHeader, ...csvRows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="mandi-mitra-settlements.csv"'
    }
  })
}
