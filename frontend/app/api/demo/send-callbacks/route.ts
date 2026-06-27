import { NextResponse } from "next/server";

const VOICE_LAYER_URL = process.env.VOICE_LAYER_URL || "http://localhost:8000";

// Proxy to Voice Layer POST /callback/farmer — triggers outbound SMS/call to all farmers in a pool
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // body: { poolId, phone_number, language, commodity, quantity_kg, final_price_per_kg }
    const res = await fetch(`${VOICE_LAYER_URL}/callback/farmer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Voice Layer error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Failed to send callbacks:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
