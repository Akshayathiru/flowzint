// TODO: replace with useQuery('/api/farmers/KAN-TOM-001/trust-breakdown')

import React from "react";

export default function TrustScoreExplainer() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
      <div className="mb-4">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Trust Score Breakdown
        </span>
      </div>

      {/* Factors Table/List */}
      <div className="flex flex-col gap-4">
        {/* Factor 1: Confirmed Deliveries */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="font-sans text-xs text-gray-600 w-40 shrink-0">
            Confirmed Deliveries
          </span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-field-green rounded-full" style={{ width: "92%" }} />
          </div>
          <span className="font-sans text-xs text-gray-500 w-16 text-right font-medium">
            11 / 12
          </span>
        </div>

        {/* Factor 2: No-Shows */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="font-sans text-xs text-gray-600 w-40 shrink-0">
            No-Shows
          </span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-alert-red rounded-full" style={{ width: "8%" }} />
          </div>
          <span className="font-sans text-xs text-gray-500 w-16 text-right font-medium">
            1 / 12
          </span>
        </div>

        {/* Factor 3: Callback Confirmations */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="font-sans text-xs text-gray-600 w-40 shrink-0">
            Callback Confirmations
          </span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-sky-blue rounded-full" style={{ width: "100%" }} />
          </div>
          <span className="font-sans text-xs text-gray-500 w-16 text-right font-medium">
            12 / 12
          </span>
        </div>
      </div>

      {/* Regulatory/Policy Callout Box */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-5">
        <p className="font-sans text-xs text-gray-500 leading-relaxed">
          Trust score affects pool weight. Farmers below 2.0 contribute at 50%
          weight. Farmers above 4.0 are flagged as priority callers for future
          pools.
        </p>
      </div>
    </div>
  );
}
