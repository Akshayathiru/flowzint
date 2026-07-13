"use client";

import React, { useEffect, useState } from "react";
import { Link, usePathname, useRouter } from "@/lib/navigation";
import { LayoutDashboard, User, CheckCircle, Store, Play } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useFarmerSessionStore } from "@/store/farmerSessionStore";

export default function FarmerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { phone, clearSession } = useFarmerSessionStore();

  const [poolCount, setPoolCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/active`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPoolCount(data.length);
      })
      .catch(() => {}); // silently fail, show nothing
  }, []);

  const farmerNavItems = [
    { label: "My Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/farmer/profile", icon: User },
    { label: "Settlements", href: "/farmer/settlements", icon: CheckCircle },
    { label: "Buyers", href: "/farmer/buyers", icon: Store },
    { label: "Demo Panel", href: "/demo", icon: Play },
  ];

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-40 flex flex-col font-sans select-none shadow-sm">
      {/* TOP SECTION */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <span className="font-display font-bold text-sm tracking-widest uppercase text-soil-brown">
          MANDI MITRA
        </span>
        <p className="font-sans text-[10px] text-gray-400 mt-0.5 font-semibold">
          Farmer Portal
        </p>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="px-3 pt-4 flex flex-col gap-1 overflow-y-auto pr-1">
        {farmerNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
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
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* FARMER IDENTITY & SIGN OUT */}
      {phone && (
        <div className="px-4 py-4 border-t border-gray-100 shrink-0 bg-white flex flex-col gap-1.5">
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-semibold text-xs text-charcoal truncate font-mono">
              {phone}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="border border-field-green text-field-green text-[9px] uppercase tracking-wider rounded px-2 py-0.5 font-bold select-none bg-field-green/5">
                FARMER
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
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

      {/* SYSTEM STATUS INDICATOR */}
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
          {poolCount !== null
            ? `${poolCount} active pool${poolCount !== 1 ? "s" : ""}`
            : "System Live"}
        </p>
      </div>
    </aside>
  );
}
