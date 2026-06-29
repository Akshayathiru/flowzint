"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BuyerSidebar from "./BuyerSidebar";
import MobileNav from "./MobileNav";

export function ConditionalSidebar() {
  const pathname = usePathname();

  // Don't show any sidebar on login, landing, or buyer registration pages
  const noSidebarRoutes = ["/login", "/buyer/register"];
  const isLanding = pathname === "/" || pathname.match(/^\/[a-z]{2}(\/|$)/); // locale root
  const isNoSidebar =
    noSidebarRoutes.some((r) => pathname.includes(r)) || !!isLanding;

  if (isNoSidebar) return null;

  // Show buyer sidebar for all /buyer/* routes
  const isBuyerRoute = pathname.includes("/buyer");

  if (isBuyerRoute) {
    return (
      <>
        <div className="hidden lg:block">
          <BuyerSidebar />
        </div>
        <div className="block lg:hidden">
          <MobileNav />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="block lg:hidden">
        <MobileNav />
      </div>
    </>
  );
}
