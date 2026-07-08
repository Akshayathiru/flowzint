"use client";

import React from "react";
import Link from "next/link";

export default function DemoTriggerButton() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
      <Link
        href="/demo"
        className="bg-charcoal text-white rounded-full px-3 py-2 font-sans font-medium text-xs shadow-md hover:bg-stone-800 transition-colors flex items-center select-none"
      >
        <span className="w-1.5 h-1.5 bg-harvest-gold rounded-full inline-block mr-2 animate-pulse" />
        Demo
      </Link>
    </div>
  );
}
