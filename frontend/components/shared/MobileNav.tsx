"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckCircle,
  Menu,
} from "lucide-react";

const mobileItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Farmers", href: "/farmers", icon: Users },
  { label: "Buyers", href: "/buyers", icon: Building2 },
  { label: "Settlements", href: "/settlements", icon: CheckCircle },
  { label: "More", href: "/admin/settings", icon: Menu },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 h-16 lg:hidden block font-sans"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {mobileItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? "bg-warm-cream text-soil-brown font-semibold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-soil-brown" : "text-gray-400"
                }`}
                strokeWidth={1.5}
              />
              <span
                className={`text-[10px] leading-none ${
                  isActive ? "text-soil-brown font-medium" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
