import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
// We override to point directly to the voice layer (port 5000) for hackathon demo
const VOICE_LAYER_URL = "http://127.0.0.1:5000";

export async function GET() {
  try {
    const res = await fetch(`${VOICE_LAYER_URL}/api/pools/active`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch active pools from backend:", error);
    return NextResponse.json({ error: "Failed to fetch active pools" }, { status: 500 });
  }
}


