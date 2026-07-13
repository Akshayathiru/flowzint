"use client";

import React from "react";
import { Link, usePathname } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Store,
  CheckCircle,
  Play,
  Settings,
} from "lucide-react";
import { usePoolStore } from "@/store/poolStore";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const { pools } = usePoolStore();
  const { user, signOut, isAdmin, isViewer } = useAuth();

  const activePoolsCount = pools.length || 3;

  const navItems = [
    { label: t("dashboard"), key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: t("farmers"), key: "farmers", href: "/farmers", icon: Users },
    { label: t("buyers"), key: "buyers", href: "/buyers", icon: Store },
    { label: t("settlements"), key: "settlements", href: "/settlements", icon: CheckCircle },
    { label: t("settings"), key: "settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-56 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-40 flex flex-col lg:flex hidden font-sans select-none">
      {/* TOP SECTION */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <span className="font-display font-bold text-sm tracking-widest uppercase text-soil-brown">
          MANDI MITRA
        </span>
        <p className="font-sans text-[10px] text-gray-500 mt-0.5 font-semibold">
          Admin Dashboard
        </p>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="px-3 pt-4 flex flex-col gap-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          if (item.key === "demo" && (isViewer || !isDemoMode)) {
            return null;
          }
          if (item.key === "settings" && !isAdmin) {
            return null;
          }

          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-3 pl-3 pr-3 py-2 rounded-lg font-sans text-xs transition-colors cursor-pointer w-full border-l-4 ${
                isActive
                  ? "bg-warm-cream border-soil-brown text-soil-brown font-medium"
                  : "border-transparent font-semibold text-gray-500 hover:bg-gray-50 hover:text-charcoal"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="flex-1">{item.label}</span>

              {item.key === "demo" && (
                <span className="w-1.5 h-1.5 rounded-full bg-harvest-gold animate-pulse ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* USER DETAILS & LOGOUT */}
      {user && (
        <div className="px-4 py-4 border-t border-gray-100 shrink-0 bg-white flex flex-col gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-sans text-xs font-semibold text-charcoal truncate" title={user.email}>
              {user.email}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="border border-soil-brown/30 rounded px-2.5 py-1 text-[10px] text-soil-brown font-bold tracking-wider uppercase select-none bg-soil-brown/10">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-left font-sans text-xs font-semibold text-alert-red hover:underline mt-1 cursor-pointer select-none"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* LANGUAGE SWITCHER */}
      <div className="px-4 py-4 border-t border-gray-100 shrink-0 bg-white">
        <span className="font-sans text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-2">
          Language
        </span>
        <LanguageSwitcher />
      </div>

      {/* BOTTOM STATUS */}
      <div className="px-4 py-4 border-t border-gray-100 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-field-green animate-pulse"></span>
          </span>
          <span className="font-sans text-xs text-gray-455 font-bold">
            System Live
          </span>
        </div>
        <p className="font-sans text-[10px] text-gray-500 mt-1 font-semibold">
          {activePoolsCount} active pools
        </p>
      </div>
    </aside>
  );
}
