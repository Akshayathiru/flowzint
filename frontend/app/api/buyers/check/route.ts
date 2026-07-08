import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone') ?? ''
  try {
    const res = await fetch(
      `${BACKEND_URL}/buyers/check?phone=${encodeURIComponent(phone)}`,
      { cache: 'no-store' }
    )
    if (!res.ok) throw new Error(`Backend error: ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to check buyer phone:', error)
    return NextResponse.json({ phone, exists: false })
  }
}
