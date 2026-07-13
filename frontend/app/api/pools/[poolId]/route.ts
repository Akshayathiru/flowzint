import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  const { poolId } = await params;
  try {
    // The real backend has no single-pool-by-id endpoint, so fetch the
    // active pools list and find the matching pool client-side.
    const res = await fetch(`${BACKEND_URL}/active`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const pools = await res.json();
    const pool = Array.isArray(pools)
      ? pools.find((p: { poolId: string }) => String(p.poolId) === String(poolId))
      : undefined;
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }
    return NextResponse.json(pool);
  } catch (error) {
    console.error(`Failed to fetch pool ${poolId} from backend:`, error);
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }
}
