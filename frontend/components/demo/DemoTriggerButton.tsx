"use client";

import React from "react";
import Link from "next/link";

export default function DemoTriggerButton() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-pulse">
      <Link
        href="/demo"
        className="bg-alert-red text-white rounded-full px-4 py-3 font-sans font-semibold text-xs shadow-lg hover:bg-red-700 transition-colors flex items-center select-none"
      >
        <span className="w-2 h-2 bg-white rounded-full inline-block mr-2 animate-ping" />
        Demo Panel
      </Link>
    </div>
  );
}
