import { NextResponse } from 'next/server'

// TODO: proxy to FastAPI POST /api/demo/retry-callbacks — re-triggers Bulbul for no_answer farmers
export async function POST(req: Request) {
  try {
    const body = await req.json()
    return NextResponse.json({ success: true, poolId: body.poolId, retriedCount: 2 })
  } catch {
    return NextResponse.json({ success: true, poolId: null, retriedCount: 2 })
  }
}
