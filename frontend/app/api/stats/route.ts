import { NextResponse } from "next/server";

// TODO: proxy to FastAPI GET /api/stats
export async function GET() {
  return NextResponse.json({
    activePoolsCount: 3,
    farmersCalledTodayCount: 47,
    settlementsCount: 128,
    avgPricePremiumPct: 18,
    liveBuyerCallsCount: 1,
  });
}
