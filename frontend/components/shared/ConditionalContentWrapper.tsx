"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ConnectionBanner } from "./ConnectionBanner";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { ErrorBoundary } from "./ErrorBoundary";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/[a-z]{2}(\/.*)?$/)
  if (!match) return pathname
  return match[1] || "/"
}

function isLandingOrLoginPage(pathname: string): boolean {
  const cleanPath = stripLocale(pathname);
  return (
    cleanPath === "/" ||
    cleanPath === "/login" ||
    cleanPath.startsWith("/login/") ||
    cleanPath === "/buyer/register" ||
    cleanPath === "/farmer/register" ||
    cleanPath === "/sarvam-showcase"
  );
}

export function ConditionalContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useTokenRefresh();
  const pathname = usePathname();
  const isLandingOrLogin = isLandingOrLoginPage(pathname);
  const status = useConnectionStatus();

  return (
    <div className="flex min-h-screen bg-[#FBF7F0] w-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:z-50 focus:outline-none focus:ring-2 focus:ring-[#6B4226] text-sm font-semibold text-[#6B4226]"
      >
        Skip to main content
      </a>
      <ConnectionBanner />
      <div
        id="main-content"
        className={`flex-1 min-h-screen overflow-y-auto pb-16 lg:pb-0 ${
          isLandingOrLogin ? "" : "lg:ml-56"
        } ${status !== "connected" ? "mt-8" : ""}`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
