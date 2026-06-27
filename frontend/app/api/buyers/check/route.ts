import { NextResponse } from "next/server";

// TODO: proxy to FastAPI GET /api/buyers/check?phone=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  return NextResponse.json({ phone, available: true });
}
