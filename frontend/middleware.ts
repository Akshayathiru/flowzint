import createNextIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const ADMIN_ONLY_PATHS = ["/admin/settings"];
const VIEWER_BLOCKED_PATHS = ["/demo", "/buyers/register"];
const PROTECTED_ROUTES = ["/dashboard", "/farmers", "/buyers", "/settlements", "/admin"];

const intlMiddleware = createNextIntlMiddleware({
  locales: ["en", "hi", "ta", "te", "kn", "mr"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathWithoutLocale =
    pathname.replace(/^\/(en|hi|ta|te|kn|mr)\b/, "") || "/";

  const isProtected = PROTECTED_ROUTES.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
  );
  const token = request.cookies.get("mm_auth")?.value;

  const match = pathname.match(/^\/(en|hi|ta|te|kn|mr)\b/);
  const locale = match ? match[1] : "";
  const loginPath = locale ? `/${locale}/login` : "/login";
  const dashboardPath = locale ? `/${locale}/dashboard` : "/dashboard";

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL(loginPath, request.url));
      response.cookies.delete("mm_auth");
      response.cookies.delete("mm_user");
      return response;
    }

    // Role-based access control
    if (
      ADMIN_ONLY_PATHS.some((p) => pathWithoutLocale.startsWith(p)) &&
      payload.role !== "admin"
    ) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    if (
      VIEWER_BLOCKED_PATHS.some((p) => pathWithoutLocale.startsWith(p)) &&
      payload.role === "viewer"
    ) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  if (pathWithoutLocale === "/login" && token) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
