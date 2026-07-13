"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import {
  ChevronLeft,
  Phone,
  Package,
  BarChart2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LanguageBadge from "@/components/shared/LanguageBadge";
import TrustScoreExplainer from "@/components/farmers/TrustScoreExplainer";
import FarmerCallTimeline from "@/components/farmers/FarmerCallTimeline";
import { useTranslations } from "next-intl";
import { farmerApi } from "@/lib/farmerApi";

interface PageProps {
  params: {
    phone: string;
    locale: string;
  };
}

interface FarmerProfile {
  phone: string;
  name: string | null;
  location: string;
  primary_crop: string;
  trust_score: number;
  total_calls: number;
  total_pools: number;
  total_quantity_kg: number;
  total_earnings: number;
  member_since: string;
}

interface FarmerCall {
  call_id: number;
  timestamp: string;
  crop: string;
  quantity_kg: number;
  location: string;
  language: string;
  pool_id: number | null;
  status: string;
}

interface FarmerSettlement {
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

export default function FarmerProfilePage({ params }: PageProps) {
  const t = useTranslations("farmer");
  const phoneParam = decodeURIComponent(params.phone || "");

  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [calls, setCalls] = useState<FarmerCall[]>([]);
  const [settlements, setSettlements] = useState<FarmerSettlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmer = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileData, callsData, settlementsData] = await Promise.all([
        farmerApi.getProfile(phoneParam),
        farmerApi.getCalls(phoneParam),
        farmerApi.getSettlements(phoneParam),
      ]);
      setProfile(profileData);
      setCalls(
        [...callsData].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
      setSettlements(settlementsData);
    } catch (err) {
      console.error("Failed to load farmer profile:", err);
      setError(err instanceof Error ? err.message : "Could not load farmer profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (phoneParam) {
      fetchFarmer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneParam]);

  const totalEarned = settlements.reduce((sum, item) => sum + (item.total_amount || 0), 0);

  const getScoreColorClass = (score: number) => {
    if (score >= 3.5) return "text-field-green";
    if (score >= 2.0) return "text-amber-600";
    return "text-alert-red";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 3.5) return t("trust_high");
    if (score >= 2.0) return t("trust_medium");
    return t("trust_low");
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      {/* PAGE HEADER */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Link
              href="/farmers"
              className="flex items-center gap-1 text-gray-500 hover:text-charcoal font-sans text-sm transition-colors font-medium"
            >
              <ChevronLeft size={16} />
              <span>{t("call_log_title")}</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-mono font-semibold text-base text-charcoal">
              {phoneParam}
            </span>
          </div>
        }
        subtitle={t("profile_title")}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
            <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
            <h3 className="font-sans font-semibold text-sm text-red-600">
              Could not load farmer
            </h3>
            <p className="font-sans text-xs text-gray-400 mt-1">
              Make sure the backend is running
            </p>
            <button
              onClick={fetchFarmer}
              className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : isLoading || !profile ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse space-y-3">
            <div className="h-5 bg-gray-100 rounded w-1/4" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-50 rounded w-1/2" />
          </div>
        ) : (
          <>
            {/* ROW 1: PROFILE HEADER CARD */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-300 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                {/* Col 1 — Identity */}
                <div className="flex flex-col items-start pb-4 md:pb-0">
                  <span className="font-mono text-base font-bold text-charcoal">
                    {phoneParam}
                  </span>
                  <div className="flex items-center gap-1.5 font-sans text-xs text-gray-500 mt-1.5 font-medium">
                    <LanguageBadge code={calls[0]?.language || "Unknown"} />
                    <span>&middot;</span>
                    <span>{profile.location}</span>
                  </div>
                  <span className="font-sans text-[11px] text-gray-500 mt-1">
                    Member since: {new Date(profile.member_since).toLocaleDateString()}
                  </span>
                </div>

                {/* Col 2 — Trust Score */}
                <div className="flex flex-col items-start pt-4 lg:pt-0 lg:pl-6 pb-4 md:pb-0">
                  <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-gray-500">
                    {t("trust_score")}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span
                      className={`font-display font-extrabold text-4xl ${getScoreColorClass(
                        profile.trust_score
                      )}`}
                    >
                      {profile.trust_score}
                    </span>
                    <span className="font-sans text-xs text-gray-500">/ 5.0</span>
                  </div>
                  <span
                    className={`font-sans text-xs font-semibold mt-1.5 ${getScoreColorClass(
                      profile.trust_score
                    )}`}
                  >
                    {getScoreLabel(profile.trust_score)}
                  </span>
                </div>

                {/* Col 3 — Call Stats */}
                <div className="flex flex-col items-start pt-4 lg:pt-0 lg:pl-6 pb-4 md:pb-0 gap-2">
                  <div className="flex items-center gap-2.5 text-xs text-gray-500 font-sans font-medium">
                    <Phone className="w-4.5 h-4.5 text-gray-400" />
                    <span>
                      {profile.total_calls} {t("total_calls")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-500 font-sans font-medium">
                    <Package className="w-4.5 h-4.5 text-gray-400" />
                    <span>
                      {profile.total_quantity_kg} kg {t("total_sold")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-500 font-sans font-medium">
                    <BarChart2 className="w-4.5 h-4.5 text-gray-400" />
                    <span>
                      {profile.total_calls > 0
                        ? Math.round(profile.total_quantity_kg / profile.total_calls)
                        : 0}{" "}
                      kg {t("avg_per_call")}
                    </span>
                  </div>
                </div>

                {/* Col 4 — Trust Factors */}
                <div className="flex flex-col items-start pt-4 lg:pt-0 lg:pl-6 gap-2">
                  <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {t("trust_factors")}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                    <CheckCircle className="w-4 h-4 text-field-green" />
                    <span>
                      {settlements.length} {t("confirmed_deliveries")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                    <XCircle className="w-4 h-4 text-alert-red" />
                    <span>&mdash; {t("no_shows")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                    <Phone className="w-4 h-4 text-sky-blue" />
                    <span>
                      {profile.total_calls} {t("confirmed_callbacks")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: TRUST SCORE EXPLAINER */}
            <div className="w-full">
              <TrustScoreExplainer phone={phoneParam} />
            </div>

            {/* ROW 3: POOL HISTORY TIMELINE */}
            <div className="w-full">
              <FarmerCallTimeline />
            </div>

            {/* ROW 4: SETTLEMENT EARNINGS HISTORY */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-300 transition-colors flex flex-col gap-4">
              <h3 className="font-semibold text-sm text-charcoal font-display" style={{ fontFamily: 'Mukta, sans-serif' }}>
                Settlement Earnings
              </h3>
              {settlements.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-sans">
                      <thead>
                        <tr className="border-b border-gray-100 font-sans text-gray-500 font-semibold">
                          <th scope="col" className="pb-2">Pool ID</th>
                          <th scope="col" className="pb-2">Crop</th>
                          <th scope="col" className="pb-2">Qty</th>
                          <th scope="col" className="pb-2">Price/kg</th>
                          <th scope="col" className="pb-2">Premium</th>
                          <th scope="col" className="pb-2 text-right">Total Earnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-sans text-gray-655">
                        {settlements.map((s, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-2.5 font-mono text-xs text-charcoal">{s.pool_id}</td>
                            <td className="py-2.5">
                              <span className="bg-soil-brown/10 text-soil-brown font-semibold text-[10px] uppercase px-2 py-0.5 rounded">
                                {s.crop}
                              </span>
                            </td>
                            <td className="py-2.5">{s.your_quantity_kg} kg</td>
                            <td className="py-2.5">₹{s.price_per_kg}</td>
                            <td className="py-2.5">
                              <span className="bg-field-green/10 text-field-green font-bold text-[10px] px-1.5 py-0.5 rounded">
                                +{s.premium_percent}%
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-bold text-field-green">₹{s.total_amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs font-medium text-field-green">
                    <span>Total earned:</span>
                    <span className="text-sm font-bold">₹{totalEarned}</span>
                  </div>
                </div>
              ) : (
                <p className="font-sans text-xs text-gray-500">No settlement history found.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
