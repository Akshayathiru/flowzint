// TODO: replace with useQuery('/api/farmers/KAN-TOM-001/pools')

import React from "react";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";

interface HistoryEntry {
  poolId: string;
  date: string;
  crop: string;
  qty: number;
  finalPrice: number | null;
  premiumPct: number | null;
  status: "settled" | "expired";
}

const poolHistory: HistoryEntry[] = [
  {
    poolId: "KAN-TOM-001",
    date: "Today",
    crop: "Tomatoes",
    qty: 80,
    finalPrice: 15,
    premiumPct: 25,
    status: "settled",
  },
  {
    poolId: "KAN-TOM-008",
    date: "3 days ago",
    crop: "Tomatoes",
    qty: 120,
    finalPrice: 13,
    premiumPct: 8,
    status: "settled",
  },
  {
    poolId: "KAN-TOM-014",
    date: "1 week ago",
    crop: "Tomatoes",
    qty: 200,
    finalPrice: null,
    premiumPct: null,
    status: "expired",
  },
  {
    poolId: "KAN-TOM-019",
    date: "2 weeks ago",
    crop: "Tomatoes",
    qty: 150,
    finalPrice: 14,
    premiumPct: 17,
    status: "settled",
  },
  {
    poolId: "KAN-ONI-003",
    date: "3 weeks ago",
    crop: "Onions",
    qty: 310,
    finalPrice: 19,
    premiumPct: 12,
    status: "settled",
  },
];

export default function FarmerCallTimeline() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
      <div className="mb-6">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Pool History
        </span>
      </div>

      {/* Timeline List */}
      <div className="flex flex-col gap-6 relative pl-6 z-0">
        {poolHistory.map((entry, idx) => {
          const isSettled = entry.status === "settled";
          return (
            <div key={entry.poolId} className="relative flex items-start gap-4">
              {/* Vertical Line */}
              {idx < poolHistory.length - 1 && (
                <div className="absolute left-[-16px] top-5 bottom-[-24px] w-[1px] bg-gray-250 -z-10" />
              )}

              {/* Circle Node */}
              <div
                className={`absolute left-[-24px] top-1.5 w-[17px] h-[17px] rounded-full border-2 shrink-0 ${
                  isSettled
                    ? "border-field-green bg-field-green/10 animate-pulse"
                    : "border-gray-300 bg-gray-100"
                }`}
              />

              {/* Content Panel */}
              <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4 w-full">
                <div className="flex flex-col">
                  {/* Pool ID & Crop info */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/pool/${entry.poolId}`}
                      className="font-mono text-xs text-sky-blue hover:underline font-bold"
                    >
                      {entry.poolId}
                    </Link>
                    <span className="text-gray-300">&middot;</span>
                    <span className="font-sans text-xs text-gray-500 font-semibold">
                      {entry.crop}
                    </span>
                  </div>

                  {/* Quantity & Pricing */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-display font-bold text-sm text-charcoal">
                      {entry.qty} kg
                    </span>
                    {isSettled && (
                      <>
                        <span className="font-display font-semibold text-sm text-field-green">
                          ₹{entry.finalPrice}/kg
                        </span>
                        <span className="bg-field-green/10 text-field-green text-[9px] font-bold rounded px-1.5 py-0.5 font-sans">
                          +{entry.premiumPct}% vs mandi
                        </span>
                      </>
                    )}
                    {!isSettled && (
                      <span className="font-sans text-xs text-gray-400 italic">
                        Pool expired &mdash; lot not sold
                      </span>
                    )}
                  </div>

                  {/* Badge */}
                  <div className="mt-2">
                    <StatusBadge status={entry.status} />
                  </div>
                </div>

                {/* Date */}
                <span className="font-sans text-xs text-gray-400 whitespace-nowrap self-start sm:self-center">
                  {entry.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
