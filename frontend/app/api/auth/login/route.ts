import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

const DEMO_USERS = [
  {
    userId: "u1",
    email: "admin@mandimitra.in",
    password: "admin2024",
    role: "admin" as const,
    orgId: "org1",
  },
  {
    userId: "u2",
    email: "operator@mandimitra.in",
    password: "demo2024",
    role: "operator" as const,
    orgId: "org1",
  },
  {
    userId: "u3",
    email: "viewer@mandimitra.in",
    password: "view2024",
    role: "viewer" as const,
    orgId: "org1",
  },
];

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
    });

    const response = NextResponse.json({ role: user.role, email: user.email });

    response.cookies.set("mm_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    // Non-httpOnly cookie for client-side role display
    response.cookies.set(
      "mm_user",
      encodeURIComponent(JSON.stringify({ email: user.email, role: user.role })),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
        path: "/",
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
