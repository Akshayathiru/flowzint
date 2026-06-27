import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

// TODO: proxy to FastAPI GET /api/buyers/check?phone=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone')
  // Simulate: +91 8012345678 is already taken
  // Normalize by stripping whitespaces
  const normalizedPhone = phone ? phone.replace(/\s+/g, '') : ''
  const exists = normalizedPhone === '+918012345678'
  return NextResponse.json({ phone, exists })
}
