import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;
  try {
    const res = await fetch(`${BACKEND_URL}/farmers/${encodeURIComponent(phone)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to fetch farmer ${phone}:`, error);
    return NextResponse.json({ phone, trustScore: 100, totalCalls: 0, pools: [] });
  }
}
