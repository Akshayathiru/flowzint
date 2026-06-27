import { NextResponse } from "next/server";

// TODO: proxy to FastAPI and emit WebSocket event
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ success: true, ...body });
}
