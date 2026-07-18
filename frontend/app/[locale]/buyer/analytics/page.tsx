"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { buyerApi } from "@/lib/buyerApi";
import { localizeValue } from "@/lib/dataTranslations";
import { useTranslations, useLocale } from "next-intl";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PieChart, AlertCircle, Loader2 } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";

interface BuyerCallRecord {
  poolId: string;
  date: string;
  crop: string;
  district: string;
  bid: number;
  result: "won" | "lost" | "no_answer" | "pending";
  lotQtyKg: number;
}

export default function BuyerAnalyticsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { isLoggedIn, currentBuyer, bidHistory, hasHydrated } = useBuyerSessionStore();
  const t = useTranslations("buyerAnalytics");
  const tDash = useTranslations("farmerDashboard");

  const [activePools, setActivePools] = useState<any[]>([]);
  const [wonCalls, setWonCalls] = useState<BuyerCallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [hasHydrated, isLoggedIn, router]);

  const fetchData = async () => {
    if (!currentBuyer) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch active pools
      const activeRes = await buyerApi.getActivePools();
      setActivePools(activeRes.data);

      // 2. Fetch buyer calls/settlements
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/buyers/${currentBuyer.buyer_id}/calls`
      );
      if (!res.ok) throw new Error("Failed to fetch bids history");
      const callsData: BuyerCallRecord[] = await res.json();
      setWonCalls(callsData);
    } catch (err: any) {
      console.error("Failed to load buyer analytics:", err);
      setError(err.message || tDash("error_title"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentBuyer) {
      fetchData();
    }
  }, [currentBuyer, isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  // Calculate statistics
  const totalBids = bidHistory.length;
  const wonAuctions = wonCalls.filter((c) => c.result === "won");
  const auctionsWonCount = wonAuctions.length;

  const avgPricePaid =
    wonAuctions.length > 0
      ? wonAuctions.reduce((sum, item) => sum + item.bid, 0) / wonAuctions.length
      : bidHistory.length > 0
      ? bidHistory.reduce((sum, item) => sum + item.price, 0) / bidHistory.length
      : 0;

  const totalVolume = wonAuctions.reduce((sum, item) => sum + item.lotQtyKg, 0);

  // Spend by Crop (won auctions only)
  const spendByCropMap = wonAuctions.reduce((acc: Record<string, number>, call) => {
    const cropName = localizeValue("crops", call.crop, locale);
    acc[cropName] = (acc[cropName] || 0) + (call.bid * call.lotQtyKg);
    return acc;
  }, {});

  const spendByCropData = Object.entries(spendByCropMap).map(([crop, spend]) => ({
    crop,
    spend,
  }));

  // Spend over Time (won auctions only)
  const spendOverTimeMap = wonAuctions.reduce((acc: Record<string, number>, call) => {
    const dateStr = call.date ? new Date(call.date).toLocaleDateString(locale, { month: "short", day: "numeric" }) : "Recent";
    acc[dateStr] = (acc[dateStr] || 0) + (call.bid * call.lotQtyKg);
    return acc;
  }, {});

  const spendOverTimeData = Object.entries(spendOverTimeMap).map(([date, spend]) => ({
    date,
    spend,
  }));

  // Chart data mapping
  const chartData = bidHistory.map((bid) => {
    const matchedActivePool = activePools.find((p) => Number(p.poolId) === bid.pool_id);
    const isWon = wonAuctions.some((c) => Number(c.poolId.replace(/^POOL-/, "")) === bid.pool_id);

    let status = "unknown";
    if (matchedActivePool) {
      status = matchedActivePool.status;
    } else if (isWon) {
      status = "settled";
    } else {
      // Check if this pool has a lost record in wonCalls
      const isLost = wonCalls.some(
        (c) => Number(c.poolId.replace(/^POOL-/, "")) === bid.pool_id && c.result === "lost"
      );
      status = isLost ? "settled" : "expired";
    }

    return {
      name: `Pool #${bid.pool_id}`,
      price: bid.price,
      status,
      crop: localizeValue("crops", bid.crop, locale),
      quantity: bid.quantity,
    };
  });

  const getBarColor = (status: string) => {
    switch (status) {
      case "settled":
        return "#2D6A4F"; // field-green
      case "auctioning":
        return "#3B82F6"; // sky-blue
      case "filling":
        return "#E6A817"; // harvest-gold
      default:
        return "#9CA3AF"; // gray
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans p-4 sm:p-6 lg:p-8">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-2xl font-bold text-charcoal font-display"
            style={{ fontFamily: "Mukta, sans-serif" }}
          >
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-sans">{t("subtitle")}</p>
        </div>
      </div>

      {/* ERROR STATE */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 my-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
          <h3 className="font-sans font-semibold text-sm text-red-600">
            {tDash("error_title")}
          </h3>
          <button
            onClick={fetchData}
            className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm cursor-pointer min-h-[44px]"
          >
            {tDash("retry")}
          </button>
        </div>
      ) : loading ? (
        // LOADING STATE
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse h-24" />
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-[350px] animate-pulse flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-soil-brown" />
          </div>
        </div>
      ) : (
        <>
          {/* 4 STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-[#3B82F6] shadow-sm">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-sans">
                {t("total_bids")}
              </div>
              <div className="font-display font-bold text-2xl text-charcoal mt-1">
                {totalBids}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-[#2D6A4F] shadow-sm">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-sans">
                {t("auctions_won")}
              </div>
              <div className="font-display font-bold text-2xl text-charcoal mt-1">
                {auctionsWonCount}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-[#E6A817] shadow-sm">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-sans">
                {t("avg_price")}
              </div>
              <div className="font-display font-bold text-2xl text-charcoal mt-1">
                ₹{avgPricePaid.toFixed(2)}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-[#6B4226] shadow-sm">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-sans">
                {t("total_volume")}
              </div>
              <div className="font-display font-bold text-2xl text-charcoal mt-1">
                {totalVolume.toLocaleString()} kg
              </div>
            </div>
          </div>

          {bidHistory.length === 0 ? (
            // EMPTY STATE
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <PieChart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-sans font-semibold text-sm text-gray-500">
                {t("no_bids")}
              </h3>
              <p className="font-sans text-xs text-gray-500 mt-1">
                {t("no_bids_hint")}
              </p>
            </div>
          ) : (
            <>
              {/* CHARTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* SPEND BY CROP CHART */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3
                    className="text-base font-semibold text-charcoal mb-4 font-display"
                    style={{ fontFamily: "Mukta, sans-serif" }}
                  >
                    Spend by Crop (Won Auctions)
                  </h3>
                  <div className="h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spendByCropData.length > 0 ? spendByCropData : chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey={spendByCropData.length > 0 ? "crop" : "name"} tick={{ fontSize: 11, fontFamily: "Inter" }} />
                        <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, fontFamily: "Inter", borderRadius: 8 }}
                          formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Spend"]}
                        />
                        <Bar dataKey={spendByCropData.length > 0 ? "spend" : "price"} fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* SPEND OVER TIME CHART */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3
                    className="text-base font-semibold text-charcoal mb-4 font-display"
                    style={{ fontFamily: "Mukta, sans-serif" }}
                  >
                    Spend Over Time (Won Auctions)
                  </h3>
                  <div className="h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spendOverTimeData.length > 0 ? spendOverTimeData : chartData.map((d, i) => ({ date: d.name, spend: d.price * d.quantity }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: "Inter" }} />
                        <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, fontFamily: "Inter", borderRadius: 8 }}
                          formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Spend"]}
                        />
                        <Line type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="min-w-[600px] w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">
                          {t("pool")} ID
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">
                          {t("crop")}
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">
                          {t("your_bid")}
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">
                          {t("status")}
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">
                          Qty Won / Pledged
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">
                          {t("date")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-charcoal">
                      {bidHistory.map((bid, index) => {
                        const matchedActivePool = activePools.find((p) => Number(p.poolId) === bid.pool_id);
                        const isWon = wonAuctions.some(
                          (c) => Number(c.poolId.replace(/^POOL-/, "")) === bid.pool_id
                        );
                        let status: "filling" | "auctioning" | "settled" | "expired" = "expired";
                        if (matchedActivePool) {
                          status = matchedActivePool.status;
                        } else if (isWon) {
                          status = "settled";
                        }

                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-sky-blue">
                              Pool #{bid.pool_id}
                            </td>
                            <td className="px-6 py-4 font-semibold capitalize">
                              {localizeValue("crops", bid.crop, locale)}
                            </td>
                            <td className="px-6 py-4 font-bold text-field-green" style={{ fontFamily: "Mukta" }}>
                              ₹{bid.price.toFixed(2)}/kg
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={status} />
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-600">
                              {bid.quantity} kg
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-mono">
                              {new Date(bid.timestamp).toLocaleDateString(locale, {
                                month: "short",
                                day: "numeric",
                                year: "2-digit",
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
