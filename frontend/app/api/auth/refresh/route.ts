import { NextResponse } from 'next/server'
import { verifyToken, signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// TODO: replace with real refresh token rotation
export async function POST() {
  const token = cookies().get('mm_auth')?.value
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  // Issue fresh token with same payload
  const newToken = await signToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    orgId: payload.orgId
  })

  const response = NextResponse.json({ refreshed: true })
  response.cookies.set('mm_auth', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/'
  })
  return response
}
