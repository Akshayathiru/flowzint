"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ConditionalSidebar from "./ConditionalSidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="flex min-h-screen bg-[#FBF7F0]">
      {/* Client-side conditional sidebar */}
      <ConditionalSidebar />

      {/* Main viewport area offset on desktop if sidebar is active */}
      <div
        className={`flex-1 min-h-screen overflow-y-auto ${
          isLanding ? "" : "lg:ml-56 ml-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
