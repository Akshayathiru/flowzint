import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8001";

// Proxy to FastAPI POST /buyer_offer — injects a bid (offer) for a pool
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body should have: { buyer_id, pool_id, price }
    const res = await fetch(`${BACKEND_URL}/buyer_offer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Failed to inject bid:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
