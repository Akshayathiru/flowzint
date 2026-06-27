"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ConnectionBanner } from "./ConnectionBanner";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { ErrorBoundary } from "./ErrorBoundary";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

function isLandingOrLoginPage(pathname: string): boolean {
  const cleanPath = pathname.replace(/^\/(en|hi|ta|te|kn|mr)(\/|$)/, "/");
  return cleanPath === "/" || cleanPath === "/login";
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
      <ConnectionBanner />
      <div
        className={`flex-1 min-h-screen overflow-y-auto pb-16 lg:pb-0 ${
          isLandingOrLogin ? "" : "lg:ml-56"
        } ${status !== "connected" ? "mt-8" : ""}`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
