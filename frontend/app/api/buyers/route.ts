import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/buyers`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    // Normalise to always return an array
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Failed to fetch buyers from backend:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Map frontend registration body to backend BuyerCreate schema
    const backendBody = {
      name: body.name,
      phone: body.phone,
      crop: body.crops?.[0]?.name || "potato",
      location: body.districts?.join(", ") || "Unknown",
      min_quantity: body.crops?.[0]?.minQtyKg || 100,
    };
    const res = await fetch(`${BACKEND_URL}/add_buyer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendBody),
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to register buyer:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
