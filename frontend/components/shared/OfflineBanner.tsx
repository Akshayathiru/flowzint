"use client";

import React from "react";

export default function OfflineBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
      <span className="text-xs text-amber-700 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
        Backend offline — showing demo data
      </span>
    </div>
  );
}
