"use client";

import React from "react";
import { PhoneMissed, PhoneOff, Crown } from "lucide-react";

interface BidEntry {
  buyerName: string;
  phone: string;
  callStatus: "completed" | "no_answer" | "rejected";
  bid: number | null;
  timestamp: string;
  isWinning?: boolean;
}

const initialBids: BidEntry[] = [
  {
    buyerName: "Buyer C (Murugan Agro)",
    phone: "+91 98XXX 20003",
    callStatus: "no_answer",
    bid: null,
    timestamp: "09:45:30",
  },
  {
    buyerName: "Buyer A (Ramesh Traders)",
    phone: "+91 80XXX 20001",
    callStatus: "completed",
    bid: 14,
    timestamp: "09:46:12",
  },
  {
    buyerName: "Buyer B (Sri Lakshmi)",
    phone: "+91 79XXX 20002",
    callStatus: "completed",
    bid: 15,
    timestamp: "09:46:38",
    isWinning: true,
  },
];

export default function BuyerAuctionLog() {
  const sortedBids = [...initialBids].sort((a, b) => {
    if (a.callStatus !== "completed" && b.callStatus === "completed") return 1;
    if (a.callStatus === "completed" && b.callStatus !== "completed") return -1;
    if (a.callStatus === "completed" && b.callStatus === "completed") {
      return (b.bid || 0) - (a.bid || 0);
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col gap-4">
      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Buyer Auction Log
        </span>
        <span className="font-sans text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded">
          Bulbul Outbound IVR
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {sortedBids.map((entry, idx) => {
          const isWinning = entry.isWinning && entry.callStatus === "completed";

          if (entry.callStatus === "completed") {
            return (
              <div
                key={idx}
                className={`flex justify-between items-center px-4 py-3 border border-gray-150 transition-colors ${
                  isWinning
                    ? "border-l-2 border-l-field-green bg-field-green/5 border-field-green/20"
                    : "border-l-2 border-l-gray-200 bg-white"
                } rounded-lg`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      {entry.buyerName}
                    </span>
                    {isWinning && (
                      <div className="flex items-center gap-0.5 text-harvest-gold">
                        <Crown className="w-3 h-3 text-harvest-gold fill-harvest-gold shrink-0" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          WINNER
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-gray-500">
                    {entry.phone}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span
                    className={`font-display font-bold text-sm ${
                      isWinning ? "text-field-green" : "text-gray-500"
                    }`}
                  >
                    ₹{entry.bid}/kg
                  </span>
                  <span className="font-sans text-[10px] text-gray-500">
                    {entry.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          if (entry.callStatus === "no_answer") {
            return (
              <div
                key={idx}
                className="flex justify-between items-center px-4 py-3 border border-amber-200/40 border-l-2 border-l-amber-200 bg-amber-50/50 opacity-80 rounded-lg"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-xs font-medium text-gray-500">
                    {entry.buyerName}
                  </span>
                  <span className="font-mono text-[10px] text-gray-500">
                    {entry.phone}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PhoneMissed className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-sans text-xs text-amber-600 font-medium italic">
                    No answer
                  </span>
                  <span className="font-sans text-[10px] text-gray-500 ml-1">
                    {entry.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          if (entry.callStatus === "rejected") {
            return (
              <div
                key={idx}
                className="flex justify-between items-center px-4 py-3 border border-gray-150 border-l-2 border-l-gray-100 bg-white opacity-60 rounded-lg"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-xs font-medium text-gray-500">
                    {entry.buyerName}
                  </span>
                  <span className="font-mono text-[10px] text-gray-500">
                    {entry.phone}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PhoneOff className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-sans text-xs text-gray-500 italic">
                    Call rejected
                  </span>
                  <span className="font-sans text-[10px] text-gray-500 ml-1">
                    {entry.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
