import { NextResponse } from "next/server";

// TODO: proxy to FastAPI
export async function GET(
  _req: Request,
  { params }: { params: { poolId: string } }
) {
  return NextResponse.json({ poolId: params.poolId, status: "auctioning" });
}
