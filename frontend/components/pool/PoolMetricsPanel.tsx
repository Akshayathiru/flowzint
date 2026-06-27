// TODO: replace hardcoded values with useQuery('/api/pools/detail')

import React from "react";
import { TrendingUp } from "lucide-react";

export default function PoolMetricsPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Pool Metrics
          </span>
        </div>

        <div className="flex flex-col divide-y divide-gray-100">
          <div className="flex justify-between items-center py-2.5">
            <span className="font-sans text-xs text-gray-500">Total Quantity</span>
            <span className="font-display font-semibold text-sm text-charcoal">
              1,020 kg
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="font-sans text-xs text-gray-500">Farmers Pooled</span>
            <span className="font-display font-semibold text-sm text-charcoal">
              6
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="font-sans text-xs text-gray-500">Geo Radius</span>
            <span className="font-display font-semibold text-sm text-charcoal">
              18 km
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="font-sans text-xs text-gray-500">Pool Closed At</span>
            <span className="font-mono text-xs text-charcoal">
              09:45 AM
            </span>
          </div>
        </div>
      </div>

      {/* Premium Callout Box */}
      <div className="bg-field-green/10 border border-field-green/20 rounded-lg p-3 mt-4 flex items-start gap-2.5">
        <TrendingUp className="w-4 h-4 text-field-green shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="font-sans font-semibold text-sm text-field-green leading-snug">
            ₹15/kg &mdash; 25% above mandi average
          </span>
          <span className="font-sans text-[11px] text-field-green/70 mt-0.5">
            Mandi avg today: ₹12/kg
          </span>
        </div>
      </div>
    </div>
  );
}
