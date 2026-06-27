import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

// Proxy to FastAPI POST /close_pool/{poolId}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const poolId = body.poolId ?? body.pool_id;
    if (!poolId) {
      return NextResponse.json({ success: false, error: "poolId required" }, { status: 400 });
    }
    const res = await fetch(`${BACKEND_URL}/close_pool/${poolId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ success: true, poolId, ...data });
  } catch (error) {
    console.error("Failed to close pool:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
