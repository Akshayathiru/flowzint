import { NextResponse } from "next/server";

// TODO: proxy to FastAPI
export async function GET() {
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ success: true, buyer: body });
}
