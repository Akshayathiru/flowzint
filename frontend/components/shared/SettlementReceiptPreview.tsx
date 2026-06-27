"use client";

import React from "react";
import { CheckCircle } from "lucide-react";

interface SettlementReceiptPreviewProps {
  hasDeclined?: boolean;
}

export default function SettlementReceiptPreview({
  hasDeclined = true,
}: SettlementReceiptPreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Settlement Receipt Preview
        </span>
        <span className="bg-field-green/10 text-field-green text-[10px] rounded-full px-2.5 py-0.5 font-sans font-semibold">
          SMS Ready to Send
        </span>
      </div>

      {/* Monospace Code Block */}
      <pre className="bg-gray-50 rounded-lg p-4 border border-gray-200 font-mono text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
        {`Mandi Mitra: Your 200kg tomatoes sold at Rs.15/kg (25% above market).
Buyer: Ramesh Traders, Kanchipuram.
Pickup: Tomorrow 6AM at Kanchipuram Mandi Gate 2.
Ref: KAN-TOM-001`}
      </pre>

      {/* Subtext */}
      <p className="font-sans text-xs text-gray-400 mt-3.5">
        This message will be sent in the farmer&apos;s preferred language via SMS after
        confirmation.
      </p>

      {/* Reconciliation Note */}
      {hasDeclined ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 font-sans text-xs text-amber-700">
          Note: 1 farmer declined (220kg removed). Adjusted settlement: 800kg at ₹15/kg.
        </div>
      ) : (
        <div className="bg-field-green/10 border border-field-green/20 rounded-lg p-3 mt-3 font-sans text-xs text-field-green flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-field-green shrink-0" />
          <span>All 6 farmers confirmed. Full 1,020kg settlement proceeds.</span>
        </div>
      )}

      {/* Button Row */}
      <div className="mt-5 flex items-center">
        <button className="bg-charcoal text-white rounded-lg px-4 py-2 text-xs font-sans font-semibold hover:bg-gray-800 transition-colors shadow-sm">
          Send All Callbacks
        </button>
        <button className="border border-gray-200 text-gray-600 rounded-lg px-4 py-2 text-xs font-sans font-semibold hover:bg-gray-50 ml-3 bg-white transition-colors">
          Export Settlement
        </button>
      </div>
    </div>
  );
}
