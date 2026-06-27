import { NextResponse } from "next/server";

// TODO: proxy to FastAPI GET /api/settlements/:poolId
export async function GET(
  _req: Request,
  { params }: { params: { poolId: string } }
) {
  return NextResponse.json({ poolId: params.poolId });
}
