import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";
// Override for hackathon demo to point to Voice Engine directly
const VOICE_LAYER_URL = "http://127.0.0.1:5000";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  const { poolId } = await params;
  try {
    const res = await fetch(`${VOICE_LAYER_URL}/api/pools/${poolId}/members`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to fetch pool members for ${poolId}:`, error);
    return NextResponse.json([]);
  }
}
