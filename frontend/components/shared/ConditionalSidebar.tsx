"use client";

import React from "react";
import { usePathname } from "@/lib/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function ConditionalSidebar() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  return (
    <>
      <Sidebar />
      <MobileNav />
    </>
  );
}
