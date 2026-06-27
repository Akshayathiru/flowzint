"use client";

import React from "react";
import { PhoneMissed, PhoneOff, Crown } from "lucide-react";

export interface AuctionEntry {
  buyerName: string;
  phone: string;
  callStatus: "completed" | "no_answer" | "rejected";
  bid: number | null;
  timestamp: string;
  isWinning?: boolean;
}

interface Props {
  entries: AuctionEntry[];
}

export function BuyerAuctionLog({ entries }: Props) {
  const sorted = [...entries].sort((a, b) => {
    if (a.isWinning) return -1;
    if (b.isWinning) return 1;
    if (a.bid && b.bid) return b.bid - a.bid;
    if (a.bid) return -1;
    return 1;
  });

  return (
    <div className="flex flex-col gap-2 font-sans text-xs">
      {sorted.map((entry, i) => {
        if (entry.isWinning && entry.callStatus === "completed") {
          return (
            <div
              key={i}
              className="border-l-2 border-[#2D6A4F] bg-[#2D6A4F]/5 rounded-lg px-4 py-3 border border-[#2D6A4F]/10 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-xs text-[#1C1C1E]">{entry.buyerName}</span>
                  <span className="font-mono text-[10px] text-gray-500 ml-2">{entry.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-display font-bold text-sm text-[#2D6A4F]">₹{entry.bid}/kg</span>
                  <Crown size={12} className="text-[#E6A817] fill-[#E6A817]" />
                  <span className="text-[10px] font-bold text-[#E6A817] ml-1 uppercase">Winner</span>
                </div>
              </div>
              <div className="text-[10px] text-gray-500 font-mono mt-1">{entry.timestamp}</div>
            </div>
          );
        }
        if (entry.callStatus === "no_answer") {
          return (
            <div
              key={i}
              className="border-l-2 border-amber-200 bg-amber-50/50 rounded-lg px-4 py-3 opacity-70 border border-amber-250/20 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PhoneMissed size={12} className="text-amber-500 shrink-0" />
                  <span className="text-xs text-gray-500">{entry.buyerName}</span>
                  <span className="text-xs text-amber-500 italic font-medium">No answer</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{entry.timestamp}</span>
              </div>
            </div>
          );
        }
        if (entry.callStatus === "rejected") {
          return (
            <div
              key={i}
              className="border-l-2 border-gray-100 rounded-lg px-4 py-3 opacity-60 border border-gray-150 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PhoneOff size={12} className="text-gray-500 shrink-0" />
                  <span className="text-xs text-gray-500">{entry.buyerName}</span>
                  <span className="text-xs text-gray-500 italic font-medium">Call rejected</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{entry.timestamp}</span>
              </div>
            </div>
          );
        }
        return (
          <div
            key={i}
            className="border-l-2 border-gray-200 rounded-lg px-4 py-3 border border-gray-150 shadow-sm bg-white"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-650 font-medium">{entry.buyerName}</span>
                <span className="font-mono text-[10px] text-gray-500 ml-2">{entry.phone}</span>
              </div>
              <span className="font-display font-semibold text-sm text-gray-650">₹{entry.bid}/kg</span>
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1">{entry.timestamp}</div>
          </div>
        );
      })}
    </div>
  );
}
