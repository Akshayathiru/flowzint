import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8001";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  const { poolId } = await params;
  try {
    // Reuse the main /pools/{poolId} endpoint and return settled pool data
    const res = await fetch(`${BACKEND_URL}/pools/${poolId}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to fetch settlement for pool ${poolId}:`, error);
    return NextResponse.json({ error: "Settlement not found" }, { status: 404 });
  }
}
