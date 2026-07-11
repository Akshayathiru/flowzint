import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8001'

// Proxy to FastAPI POST /demo/reset — clears all pools/offers for a fresh demo
export async function POST() {
  try {
    const res = await fetch(`${BACKEND_URL}/demo/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(`Backend error: ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to reset demo state:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
