import { NextResponse } from 'next/server'

// TODO: proxy to FastAPI POST /api/demo/reset
export async function POST() {
  return NextResponse.json({ success: true, message: 'Demo state reset' })
}
