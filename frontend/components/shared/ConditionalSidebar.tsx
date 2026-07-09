"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BuyerSidebar from "./BuyerSidebar";
import FarmerSidebar from "./FarmerSidebar";
import MobileNav from "./MobileNav";

export function ConditionalSidebar() {
  const pathname = usePathname();

  // Don't show any sidebar on login, landing, or registration pages
  const noSidebarRoutes = ["/login", "/buyer/register", "/farmer/register"];
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

  // Show farmer sidebar for all /farmer/* routes
  const isFarmerRoute = pathname.includes("/farmer");
  if (isFarmerRoute) {
    return (
      <>
        <div className="hidden lg:block">
          <FarmerSidebar />
        </div>
        <div className="block lg:hidden">
          <MobileNav />
        </div>
      </>
    );
  }

  // Everything else (admin dashboard, settings, etc.)
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
