import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/settlements`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Failed to fetch settlements from backend:", error);
    return NextResponse.json([]);
  }
}
