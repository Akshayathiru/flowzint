"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ConditionalSidebar() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <Sidebar />;
}
