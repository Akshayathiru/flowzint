import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("mm_auth");
  response.cookies.delete("mm_user");
  return response;
}
