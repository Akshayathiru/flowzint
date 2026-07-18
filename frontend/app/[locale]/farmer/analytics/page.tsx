"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useFarmerSessionStore } from "@/store/farmerSessionStore";
import { farmerApi } from "@/lib/farmerApi";
import { localizeValue } from "@/lib/dataTranslations";
import { useTranslations, useLocale } from "next-intl";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, AlertCircle, Loader2 } from "lucide-react";

interface Settlement {
  pool_id: number;
  crop: string;
  location: string;
  your_quantity_kg: number;
  price_per_kg: number;
  mandi_rate_per_kg: number;
  total_amount: number;
  premium_percent: number;
  buyers: string;
  settled_at: string;
}

export default function FarmerAnalyticsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { phone, isLoggedIn, hasHydrated } = useFarmerSessionStore();
  const t = useTranslations("farmerAnalytics");

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.push("/login?role=farmer");
    }
  }, [hasHydrated, isLoggedIn, router]);

  const fetchAnalytics = () => {
    if (!phone) return;
    setLoading(true);
    setError(null);
    farmerApi
      .getSettlements(phone)
      .then((data) => {
        setSettlements(data);
      })
      .catch((err) => {
        console.error("Failed to load earnings data:", err);
        setError(err.message || t("error_title"));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isLoggedIn && phone) {
      fetchAnalytics();
    }
  }, [phone, isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  const totalEarnings = settlements.reduce((sum, s) => sum + s.total_amount, 0);

  // Chart data mapping
  const chartData = settlements.map((s) => ({
    date: new Date(s.settled_at).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    }),
    yourPrice: s.price_per_kg,
    mandiRate: s.mandi_rate_per_kg,
    premium: s.premium_percent,
    crop: localizeValue("crops", s.crop, locale),
  }));

  // Group earnings by crop for breakdown chart
  const cropBreakdownMap = settlements.reduce((acc: Record<string, number>, s) => {
    const cropName = localizeValue("crops", s.crop, locale);
    acc[cropName] = (acc[cropName] || 0) + s.total_amount;
    return acc;
  }, {});

  const cropChartData = Object.entries(cropBreakdownMap).map(([crop, total]) => ({
    crop,
    total,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 font-sans">
        <p className="text-xs text-gray-500 font-medium">{label} ({data.crop})</p>
        <p className="text-sm text-field-green font-semibold" style={{ fontFamily: "Mukta" }}>
          {t("your_price")}: ₹{payload[0]?.value}/kg
        </p>
        {payload[1] && (
          <p className="text-xs text-gray-500">
            {t("mandi_rate")}: ₹{payload[1]?.value}/kg
          </p>
        )}
        <p className="text-xs text-field-green font-semibold">
          +{data.premium}% {t("premium")}
        </p>
      </div>
    );
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
            {t("error_title")}
          </h3>
          <button
            onClick={fetchAnalytics}
            className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm cursor-pointer min-h-[44px]"
          >
            {t("retry")}
          </button>
        </div>
      ) : loading ? (
        // LOADING STATE
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-2" />
            <div className="h-8 bg-gray-250 rounded w-1/2" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-[350px] animate-pulse flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-soil-brown" />
          </div>
        </div>
      ) : (
        <>
          {/* LARGE EARNINGS CARD */}
          <div className="bg-field-green/5 border border-field-green/20 rounded-xl p-6 mb-6 shadow-sm">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-sans">
              {t("total_earnings")}
            </span>
            <h2
              className="text-4xl font-bold text-field-green mt-1"
              style={{ fontFamily: "Mukta, sans-serif" }}
            >
              ₹{totalEarnings.toLocaleString()}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-sans">
              {t("from_pools", { count: settlements.length })}
            </p>
          </div>

          {settlements.length === 0 ? (
            // EMPTY STATE
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-sans font-semibold text-sm text-gray-500">
                {t("no_settlements")}
              </h3>
              <p className="font-sans text-xs text-gray-500 mt-1">
                {t("no_settlements_hint")}
              </p>
            </div>
          ) : (
            <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* LINE / AREA CHART */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3
                      className="text-base font-semibold text-charcoal mb-4 font-display"
                      style={{ fontFamily: "Mukta, sans-serif" }}
                    >
                      {t("earnings_chart")}
                    </h3>
                    <div className="h-[250px] sm:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: "Inter" }} />
                          <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} tickFormatter={(v) => `₹${v}`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Inter" }} />
                          <Area type="monotone" dataKey="yourPrice" fill="#2D6A4F" fillOpacity={0.1} stroke="none" />
                          <Line
                            type="monotone"
                            dataKey="yourPrice"
                            stroke="#2D6A4F"
                            strokeWidth={2}
                            name={t("your_price")}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="mandiRate"
                            stroke="#9CA3AF"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            name={t("mandi_rate")}
                            dot={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CROP BREAKDOWN CHART */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3
                      className="text-base font-semibold text-charcoal mb-4 font-display"
                      style={{ fontFamily: "Mukta, sans-serif" }}
                    >
                      Crop Breakdown (Earnings)
                    </h3>
                    <div className="h-[250px] sm:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cropChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="crop" tick={{ fontSize: 11, fontFamily: "Inter" }} />
                          <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} tickFormatter={(v) => `₹${v}`} />
                          <Tooltip
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Earnings"]}
                          />
                          <Bar dataKey="total" fill="#2D6A4F" radius={[4, 4, 0, 0]}>
                            {cropChartData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={["#2D6A4F", "#E6A817", "#3B82F6", "#6B4226", "#10B981"][index % 5]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              {/* TABLE */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="min-w-[600px] w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/50 text-[10px] font-medium uppercase tracking-widest text-gray-500 border-b border-gray-150">
                        <th className="px-4 py-3">{t("pool")}</th>
                        <th className="px-4 py-3">{t("crop")}</th>
                        <th className="px-4 py-3">{t("date")}</th>
                        <th className="px-4 py-3">{t("your_qty")}</th>
                        <th className="px-4 py-3">{t("price_per_kg")}</th>
                        <th className="px-4 py-3">{t("mandi_rate_col")}</th>
                        <th className="px-4 py-3">{t("premium")}</th>
                        <th className="px-4 py-3">{t("earnings")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans text-charcoal">
                      {settlements.map((s) => (
                        <tr key={s.pool_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-sky-blue">
                            Pool #{s.pool_id}
                          </td>
                          <td className="px-4 py-3 font-semibold capitalize">
                            {localizeValue("crops", s.crop, locale)}
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-mono">
                            {new Date(s.settled_at).toLocaleDateString(locale, {
                              month: "short",
                              day: "numeric",
                              year: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-medium">
                            {s.your_quantity_kg} kg
                          </td>
                          <td className="px-4 py-3 font-semibold text-field-green">
                            ₹{s.price_per_kg.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            ₹{s.mandi_rate_per_kg.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            {s.premium_percent > 0 ? (
                              <span className="inline-block bg-field-green/10 text-field-green text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap">
                                +{s.premium_percent}%
                              </span>
                            ) : (
                              <span className="text-gray-300">&mdash;</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-field-green" style={{ fontFamily: "Mukta" }}>
                            ₹{s.total_amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
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
