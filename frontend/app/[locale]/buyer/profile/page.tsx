"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { Gavel, CheckCircle, Percent } from "lucide-react";

interface BuyerCallRecord {
  result: "won" | "lost" | "no_answer" | "pending";
}

export default function BuyerProfilePage() {
  const router = useRouter();
  const { currentBuyer, isLoggedIn, bidHistory } = useBuyerSessionStore();

  const [auctionsWon, setAuctionsWon] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!currentBuyer) return;
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/buyers/${currentBuyer.buyer_id}/calls`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        return res.json();
      })
      .then((data: BuyerCallRecord[]) => {
        setAuctionsWon(data.filter((c) => c.result === "won").length);
      })
      .catch((err) => {
        console.error("Failed to load auctions won:", err);
        setAuctionsWon(null);
      });
  }, [currentBuyer]);

  if (!isLoggedIn || !currentBuyer) {
    return null;
  }

  // Calculate statistics from bidHistory
  const totalBids = bidHistory.length;
  const avgBidPrice =
    totalBids > 0
      ? bidHistory.reduce((sum, b) => sum + b.price, 0) / totalBids
      : 0;

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans p-6">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-charcoal"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          My Profile
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Your buyer account details
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Details */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Business Name
              </label>
              <h2 className="font-display font-semibold text-xl text-charcoal">
                {currentBuyer.name}
              </h2>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Phone Number
              </label>
              <span className="text-sm font-mono text-gray-500">{currentBuyer.phone}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Crop Interest
                </label>
                <span className="text-sm text-charcoal font-medium capitalize">
                  {currentBuyer.crop}
                </span>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Location
                </label>
                <span className="text-sm text-charcoal font-medium capitalize">
                  {currentBuyer.location}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Minimum Lot Size
              </label>
              <span className="text-sm text-charcoal font-medium">
                {currentBuyer.min_quantity} kg
              </span>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:items-start">
            <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-harvest-gold/10 text-harvest-gold flex items-center justify-center mx-auto mb-2">
                <Gavel className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                Total Bids
              </span>
              <span className="font-display font-bold text-xl text-charcoal mt-1 block">
                {totalBids}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-field-green/10 text-field-green flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                Auctions Won
              </span>
              <span className="font-display font-bold text-xl text-charcoal mt-1 block">
                {auctionsWon === null ? "—" : auctionsWon}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-soil-brown/10 text-soil-brown flex items-center justify-center mx-auto mb-2">
                <Percent className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                Avg Bid Price
              </span>
              <span className="font-display font-bold text-base text-charcoal mt-1 block truncate">
                ₹{avgBidPrice > 0 ? avgBidPrice.toFixed(2) : "0.00"}/kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BID HISTORY TABLE */}
      <div>
        <h2
          className="text-lg font-bold text-charcoal mb-4"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          Bid History
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {bidHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-semibold">
              You haven't placed any bids yet
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                    Pool ID
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                    Crop
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                    Location
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                    Price/kg
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                    Time
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {bidHistory.map((bid, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-semibold text-charcoal">
                      Pool #{bid.pool_id}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-charcoal capitalize">
                      {bid.crop}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500 capitalize">
                      {bid.location}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-field-green">
                      ₹{bid.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-charcoal">
                      {bid.quantity} kg
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-450 font-mono">
                      {new Date(bid.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      <span className="inline-flex items-center rounded-full bg-sky-blue/10 text-sky-blue px-2 py-0.5 text-[10px] font-bold">
                        Submitted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
