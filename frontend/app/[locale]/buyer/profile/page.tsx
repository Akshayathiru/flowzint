"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { Gavel, CheckCircle, Percent } from "lucide-react";
import { useTranslations } from "next-intl";

interface BuyerCallRecord {
  result: "won" | "lost" | "no_answer" | "pending";
}

export default function BuyerProfilePage() {
  const router = useRouter();
  const { currentBuyer, isLoggedIn, bidHistory, hasHydrated } = useBuyerSessionStore();
  const t = useTranslations("buyerProfile");
  const tBids = useTranslations("buyerBids");
  const tAuc = useTranslations("buyerAuctions");

  const [auctionsWon, setAuctionsWon] = useState<number | null>(null);

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [hasHydrated, isLoggedIn, router]);

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
          {t("title")}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Details */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                {t("business_name")}
              </label>
              <h2 className="font-display font-semibold text-xl text-charcoal">
                {currentBuyer.name}
              </h2>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                {t("phone")}
              </label>
              <span className="text-sm font-mono text-gray-500">{currentBuyer.phone}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                  {t("crop_interest")}
                </label>
                <span className="text-sm text-charcoal font-medium capitalize">
                  {currentBuyer.crop}
                </span>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                  {t("location")}
                </label>
                <span className="text-sm text-charcoal font-medium capitalize">
                  {currentBuyer.location}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                {t("min_lot")}
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
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest block">
                {t("total_bids")}
              </span>
              <span className="font-display font-semibold text-xl text-charcoal mt-1 block">
                {totalBids}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-field-green/10 text-field-green flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest block">
                {t("auctions_won")}
              </span>
              <span className="font-display font-semibold text-xl text-charcoal mt-1 block">
                {auctionsWon === null ? "—" : auctionsWon}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-soil-brown/10 text-soil-brown flex items-center justify-center mx-auto mb-2">
                <Percent className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest block">
                {t("avg_bid_price")}
              </span>
              <span className="font-display font-semibold text-base text-charcoal mt-1 block truncate">
                ₹{avgBidPrice > 0 ? avgBidPrice.toFixed(2) : "0.00"}/kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BID HISTORY TABLE */}
      <div>
        <h2
          className="text-lg font-semibold text-charcoal mb-4"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          {t("bid_history")}
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {bidHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-semibold">
              {t("no_bids")}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                    {tBids("pool")} ID
                  </th>
                  <th className="px-6 py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                    {tBids("crop")}
                  </th>
                  <th className="px-6 py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                    {tBids("location")}
                  </th>
                  <th className="px-6 py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                    {tBids("price")}/kg
                  </th>
                  <th className="px-6 py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                    {tBids("quantity")}
                  </th>
                  <th className="px-6 py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                    {tBids("time")}
                  </th>
                  <th className="px-6 py-3 text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                    {tBids("status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bidHistory.map((bid, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-semibold text-charcoal">
                      Pool #{bid.pool_id}
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-charcoal capitalize">
                      {bid.crop}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-gray-500 capitalize">
                      {bid.location}
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-field-green">
                      ₹{bid.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-charcoal">
                      {bid.quantity} kg
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-gray-450 font-mono">
                      {new Date(bid.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium">
                      <span className="inline-flex items-center rounded-full bg-sky-blue/10 text-sky-blue px-2 py-0.5 text-[10px] font-bold">
                        {tAuc("submitted")}
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
