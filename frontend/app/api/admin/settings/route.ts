import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

// TODO: proxy to FastAPI PATCH /api/admin/settings
export async function PATCH(req: Request) {
  const token = cookies().get('mm_auth')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
  }
  const body = await req.json()
  return NextResponse.json({ success: true, saved: body })
}

export async function GET() {
  // TODO: fetch from FastAPI
  return NextResponse.json({
    maxWindowMinutes: 90,
    geoRadiusKm: 20,
    minLotTomatoes: 250,
    minLotOnions: 300,
    minLotDefault: 150,
    trustWeights: { confirmedDeliveries: 60, noShowPenalty: 30, callbackConfirmation: 10 }
  })
}
