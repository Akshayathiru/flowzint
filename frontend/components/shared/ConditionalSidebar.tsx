"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

function isLandingOrLoginPage(pathname: string): boolean {
  const cleanPath = pathname.replace(/^\/(en|hi|ta|te|kn|mr)(\/|$)/, "/");
  return cleanPath === "/" || cleanPath === "/login";
}

export function ConditionalSidebar() {
  const pathname = usePathname();
  if (isLandingOrLoginPage(pathname)) return null;
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
