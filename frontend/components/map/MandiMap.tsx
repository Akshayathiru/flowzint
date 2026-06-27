import React from "react";

export default function MandiMap() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-[280px] shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display font-semibold text-sm text-charcoal">
            Kanchipuram Catchment
          </h3>
          <p className="font-sans text-xs text-gray-400 mt-0.5">
            18km radius &middot; 6 farmer pins
          </p>
        </div>
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Catchment Map
        </span>
      </div>

      {/* SVG Placeholder Catchment Circle and Pins */}
      <div className="flex-1 flex items-center justify-center my-1 relative">
        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          className="w-full max-h-[140px]"
        >
          {/* Grid circles */}
          <circle
            cx="75"
            cy="75"
            r="70"
            fill="none"
            stroke="#EAE6DF"
            strokeWidth="1"
          />
          <circle
            cx="75"
            cy="75"
            r="50"
            fill="none"
            stroke="#EAE6DF"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle
            cx="75"
            cy="75"
            r="30"
            fill="none"
            stroke="#EAE6DF"
            strokeWidth="1"
          />

          {/* Catchment Border */}
          <circle
            cx="75"
            cy="75"
            r="60"
            fill="none"
            stroke="#6B4226"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Center/Buyer Dot (harvest-gold) */}
          <circle
            cx="75"
            cy="75"
            r="5.5"
            fill="#E6A817"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          {/* Farmer Dots (soil-brown) */}
          <circle cx="45" cy="50" r="3.5" fill="#6B4226" />
          <circle cx="105" cy="65" r="3.5" fill="#6B4226" />
          <circle cx="60" cy="110" r="3.5" fill="#6B4226" />
          <circle cx="85" cy="100" r="3.5" fill="#6B4226" />
          <circle cx="95" cy="40" r="3.5" fill="#6B4226" />
          <circle cx="50" cy="85" r="3.5" fill="#6B4226" />
        </svg>
      </div>

      <div className="text-center">
        <span className="font-sans text-[10px] text-gray-400">
          Full map loads with Leaflet on mount
        </span>
      </div>
    </div>
  );
}
