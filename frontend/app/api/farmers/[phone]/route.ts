import { NextResponse } from "next/server";

// TODO: proxy to FastAPI GET /api/farmers/:phone
export async function GET(
  _req: Request,
  { params }: { params: { phone: string } }
) {
  return NextResponse.json({
    phone: params.phone,
    trustScore: 4.2,
    totalCalls: 12,
  });
}
