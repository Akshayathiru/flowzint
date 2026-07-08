import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("mm_auth")?.value;
  if (!token) {
    return NextResponse.json(null, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({
    email: payload.email,
    role: payload.role,
    orgId: payload.orgId,
  });
}
