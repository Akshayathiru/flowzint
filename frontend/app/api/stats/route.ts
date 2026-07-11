import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/stats`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch stats from backend:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}


