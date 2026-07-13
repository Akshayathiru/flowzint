import React from "react";
import { TrendingUp } from "lucide-react";

interface PoolMetricsPanelProps {
  crop: string;
  location: string;
  totalQuantity: number;
  farmersCount: number;
  status: string;
  winningPrice: number | null;
  auctionEndTime: string | null;
}

export default function PoolMetricsPanel({
  crop,
  location,
  totalQuantity,
  farmersCount,
  status,
  winningPrice,
  auctionEndTime,
}: PoolMetricsPanelProps) {
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
            <span className="font-sans text-xs text-gray-500">Crop</span>
            <span className="font-display font-semibold text-sm text-charcoal capitalize">
              {crop}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="font-sans text-xs text-gray-500">Location</span>
            <span className="font-display font-semibold text-sm text-charcoal capitalize">
              {location}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="font-sans text-xs text-gray-500">Total Quantity</span>
            <span className="font-display font-semibold text-sm text-charcoal">
              {totalQuantity.toLocaleString()} kg
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="font-sans text-xs text-gray-500">Farmers Pooled</span>
            <span className="font-display font-semibold text-sm text-charcoal">
              {farmersCount}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="font-sans text-xs text-gray-500">Auction Ends</span>
            <span className="font-mono text-xs text-charcoal">
              {auctionEndTime ? new Date(auctionEndTime).toLocaleString() : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Status / Settlement Callout */}
      {winningPrice !== null ? (
        <div className="bg-field-green/10 border border-field-green/20 rounded-lg p-3 mt-4 flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-field-green shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-sans font-semibold text-sm text-field-green leading-snug">
              Settled at ₹{winningPrice}/kg
            </span>
            <span className="font-sans text-[11px] text-field-green/70 mt-0.5 capitalize">
              Status: {status}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4 flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-sans font-semibold text-sm text-charcoal leading-snug capitalize">
              Status: {status}
            </span>
            <span className="font-sans text-[11px] text-gray-500 mt-0.5">
              Not yet settled
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
