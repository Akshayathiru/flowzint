"use client";

import React from "react";
import dynamic from "next/dynamic";

const MandiMapInner = dynamic(() => import("./MandiMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center font-sans text-xs text-gray-500">
      Loading Leaflet Map...
    </div>
  ),
});

export default function MandiMap() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-[320px] shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
      <div className="flex justify-between items-start shrink-0 mb-3">
        <div>
          <h3 className="font-display font-semibold text-sm text-charcoal">
            Kanchipuram Catchment
          </h3>
          <p className="font-sans text-xs text-gray-500 mt-0.5">
            20km radius &middot; 6 farmer pins
          </p>
        </div>
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Catchment Map
        </span>
      </div>

      <div className="h-[230px] w-full relative rounded-lg overflow-hidden border border-gray-150 shrink-0">
        <MandiMapInner />
      </div>
    </div>
  );
}
