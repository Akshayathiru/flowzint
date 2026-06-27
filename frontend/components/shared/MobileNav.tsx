"use client";

import React from "react";
import { Link, usePathname } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckCircle,
  Menu,
} from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const mobileItems = [
    { label: t("dashboard"), key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: t("farmers"), key: "farmers", href: "/farmers", icon: Users },
    { label: t("buyers"), key: "buyers", href: "/buyers", icon: Building2 },
    { label: t("settlements"), key: "settlements", href: "/settlements", icon: CheckCircle },
    { label: t("settings"), key: "settings", href: "/admin/settings", icon: Menu },
  ];

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
              key={item.key}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? "bg-warm-cream text-soil-brown font-semibold"
                  : "text-gray-500 hover:text-gray-600"
              }`}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-soil-brown" : "text-gray-500"
                }`}
                strokeWidth={1.5}
              />
              <span
                className={`text-[10px] leading-none ${
                  isActive ? "text-soil-brown font-medium" : "text-gray-500"
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
