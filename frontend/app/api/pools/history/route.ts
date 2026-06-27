import { NextResponse } from "next/server";

// TODO: proxy to FastAPI GET /api/pools/history
export async function GET() {
  return NextResponse.json({ pools: [], total: 0, page: 1 });
}
