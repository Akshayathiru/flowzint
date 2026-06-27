import { NextResponse } from 'next/server'

// TODO: proxy to FastAPI PUT /api/buyers/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  return NextResponse.json({
    id: params.id,
    ...body,
    updatedAt: new Date().toISOString()
  })
}

// TODO: proxy to FastAPI DELETE /api/buyers/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ id: params.id, deactivated: true })
}
