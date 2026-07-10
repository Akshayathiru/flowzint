"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BuyerSidebar from "./BuyerSidebar";
import FarmerSidebar from "./FarmerSidebar";
import MobileNav from "./MobileNav";

// Strip locale prefix (e.g. /en/farmer/dashboard → /farmer/dashboard)
function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/[a-z]{2}(\/.*)$/)
  return match ? match[1] : pathname
}

export function ConditionalSidebar() {
  const rawPathname = usePathname();
  const pathname = stripLocale(rawPathname);

  // Don't show any sidebar on login, landing, or registration pages
  const noSidebarRoutes = ["/login", "/buyer/register", "/farmer/register"];
  const isLanding = pathname === "/";
  const isNoSidebar =
    noSidebarRoutes.some((r) => pathname === r || pathname.startsWith(r + "/")) || isLanding;

  if (isNoSidebar) return null;

  // Show farmer sidebar for exact /farmer or /farmer/*
  if (pathname === "/farmer" || pathname.startsWith("/farmer/")) {
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

  // Show buyer sidebar for exact /buyer or /buyer/*
  if (pathname === "/buyer" || pathname.startsWith("/buyer/")) {
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
