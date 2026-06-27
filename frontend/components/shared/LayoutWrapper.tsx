"use client";

import React from "react";
import { usePathname } from "@/lib/navigation";
import { ConditionalSidebar } from "./ConditionalSidebar";
import { ConnectionBanner } from "./ConnectionBanner";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { ErrorBoundary } from "./ErrorBoundary";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingOrLogin = pathname === "/" || pathname === "/login";
  const status = useConnectionStatus();

  return (
    <div className="flex min-h-screen bg-[#FBF7F0] w-full">
      <ConnectionBanner />
      
      {/* Client-side conditional sidebar */}
      <ConditionalSidebar />

      {/* Main viewport area offset on desktop if sidebar is active */}
      <div
        className={`flex-1 min-h-screen overflow-y-auto ${
          isLandingOrLogin ? "" : "lg:ml-56 ml-0 pb-16 lg:pb-0"
        } ${status !== "connected" ? "mt-8" : ""}`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
}
