"use client";

// TODO: replace with live count from usePoolStore

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckCircle,
  Play,
  Settings,
  UserPlus,
} from "lucide-react";
import { usePoolStore } from "@/store/poolStore";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Farmers", href: "/farmers", icon: Users },
  { label: "Buyers", href: "/buyers", icon: Building2 },
  { label: "Settlements", href: "/settlements", icon: CheckCircle },
  { label: "Demo Panel", href: "/demo", icon: Play },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const { pools } = usePoolStore();

  const activePoolsCount = pools.length || 3; // Fallback to 3 if empty

  return (
    <aside className="w-56 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-40 flex flex-col lg:flex hidden font-sans select-none">
      {/* TOP SECTION */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <span className="font-display font-bold text-sm tracking-widest uppercase text-soil-brown">
          MANDI MITRA
        </span>
        <p className="font-sans text-[10px] text-gray-400 mt-0.5 font-semibold">
          Operator Dashboard
        </p>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="px-3 pt-4 flex flex-col gap-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          // Demo Panel check
          if (item.label === "Demo Panel" && !isDemoMode) {
            return null;
          }

          // Active route check
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg font-sans text-xs font-semibold transition-colors cursor-pointer w-full relative ${
                isActive
                  ? "bg-warm-cream text-soil-brown font-bold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-charcoal"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-soil-brown rounded-full" />
              )}
              <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="flex-1">{item.label}</span>

              {item.label === "Demo Panel" && (
                <span className="w-1.5 h-1.5 rounded-full bg-harvest-gold animate-pulse ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* MIDDLE DIVIDER SECTION */}
      <div className="px-3 py-4 border-t border-gray-100 shrink-0">
        <span className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-2 px-1">
          Quick Add
        </span>
        <Link
          href="/buyers/register"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg font-sans text-[11px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-charcoal transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
          <span>Register Buyer</span>
        </Link>
      </div>

      {/* BOTTOM SECTION */}
      <div className="px-4 py-4 border-t border-gray-100 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-field-green animate-pulse"></span>
          </span>
          <span className="font-sans text-xs text-gray-450 font-bold">
            System Live
          </span>
        </div>
        <p className="font-sans text-[10px] text-gray-400 mt-1 font-semibold">
          {activePoolsCount} active pools
        </p>
      </div>
    </aside>
  );
}
