"use client";

import React from "react";
import Link from "next/link";

export default function TopBar() {
  return (
    <nav className="h-[56px] bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center">
        <span className="font-display font-bold text-sm tracking-widest uppercase text-soil-brown">
          MANDI MITRA
        </span>
        <div className="border-r border-gray-200 mx-4 h-4" />
        <span className="font-sans text-xs text-gray-400 font-medium">
          Operator Dashboard
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 border border-green-200 bg-green-50/50 rounded-full px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="font-sans text-[10px] font-bold text-green-600 tracking-wider">
            LIVE
          </span>
        </div>
        <div className="border-r border-gray-200 h-4 mx-1" />
        <Link
          href="/demo"
          className="border border-gray-300 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition-colors"
        >
          + New Demo Call
        </Link>
      </div>
    </nav>
  );
}
