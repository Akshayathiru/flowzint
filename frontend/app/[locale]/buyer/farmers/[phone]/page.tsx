"use client";

import React, { useEffect, useState } from "react";
import { Link, useRouter } from "@/lib/navigation";
import {
  ChevronLeft,
  Phone,
  Package,
  BarChart2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LanguageBadge from "@/components/shared/LanguageBadge";
import TrustScoreExplainer from "@/components/farmers/TrustScoreExplainer";
import FarmerCallTimeline from "@/components/farmers/FarmerCallTimeline";
import { useTranslations } from "next-intl";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";

interface PageProps {
  params: {
    phone: string;
    locale: string;
  };
}

const mockProfile = {
  phone: "+91 98XXX 10001",
  district: "Kanchipuram",
  primaryCrop: "Tomatoes",
  language: "ta",
  firstCall: "14 Jan 2025",
  totalCalls: 12,
  totalQtySold: 860,
  averageQtyPerCall: 72,
  trustScore: 4.2,
  trustFactors: {
    confirmedDeliveries: 11,
    noShows: 1,
    confirmedCallbacks: 12,
  },
};

const mockSettlements = [
  { poolId: "KAN-TOM-001", crop: "Tomatoes", qtyKg: 80, pricePerKg: 15.5, premiumPct: 5, totalEarnings: 1302 },
  { poolId: "KAN-POT-003", crop: "Potatoes", qtyKg: 120, pricePerKg: 12.0, premiumPct: 0, totalEarnings: 1440 },
];

export default function BuyerFarmerProfilePage({ params }: PageProps) {
  const router = useRouter();
  const t = useTranslations("farmer");
  const { isLoggedIn } = useBuyerSessionStore();
  const phoneParam = decodeURIComponent(params.phone || mockProfile.phone);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const totalEarned = mockSettlements.reduce((sum, item) => sum + item.totalEarnings, 0);

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
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Link
              href="/buyer/farmers"
              className="flex items-center gap-1 text-gray-500 hover:text-charcoal font-sans text-sm transition-colors font-medium"
            >
              <ChevronLeft size={16} />
              <span>Farmer Registry</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-mono font-semibold text-base text-charcoal">
              {phoneParam}
            </span>
          </div>
        }
        subtitle="Farmer Profile"
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* ROW 1: PROFILE HEADER CARD */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-300 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {/* Col 1 — Identity */}
            <div className="flex flex-col items-start pb-4 md:pb-0">
              <span className="font-mono text-base font-bold text-charcoal">
                {phoneParam}
              </span>
              <div className="flex items-center gap-1.5 font-sans text-xs text-gray-500 mt-1.5 font-medium">
                <LanguageBadge code={mockProfile.language} />
                <span>&middot;</span>
                <span>{mockProfile.district}</span>
              </div>
              <span className="font-sans text-[11px] text-gray-500 mt-1">
                First call: {mockProfile.firstCall}
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
                    mockProfile.trustScore
                  )}`}
                >
                  {mockProfile.trustScore}
                </span>
                <span className="font-sans text-xs text-gray-500">/ 5.0</span>
              </div>
              <span
                className={`font-sans text-xs font-semibold mt-1.5 ${getScoreColorClass(
                  mockProfile.trustScore
                )}`}
              >
                {getScoreLabel(mockProfile.trustScore)}
              </span>
            </div>

            {/* Col 3 — Call Stats */}
            <div className="flex flex-col items-start pt-4 lg:pt-0 lg:pl-6 pb-4 md:pb-0 gap-2">
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-sans font-medium">
                <Phone className="w-4.5 h-4.5 text-gray-400" />
                <span>
                  {mockProfile.totalCalls} {t("total_calls")}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-sans font-medium">
                <Package className="w-4.5 h-4.5 text-gray-400" />
                <span>
                  {mockProfile.totalQtySold} kg {t("total_sold")}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-sans font-medium">
                <BarChart2 className="w-4.5 h-4.5 text-gray-400" />
                <span>
                  {mockProfile.averageQtyPerCall} kg {t("avg_per_call")}
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
                  {mockProfile.trustFactors.confirmedDeliveries} {t("confirmed_deliveries")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                <XCircle className="w-4 h-4 text-alert-red" />
                <span>
                  {mockProfile.trustFactors.noShows} {t("no_shows")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                <Phone className="w-4 h-4 text-sky-blue" />
                <span>
                  {mockProfile.trustFactors.confirmedCallbacks} {t("confirmed_callbacks")}
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
            Settlement History
          </h3>
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-gray-100 font-sans text-gray-500 font-semibold">
                    <th scope="col" className="pb-2">Pool ID</th>
                    <th scope="col" className="pb-2">Crop</th>
                    <th scope="col" className="pb-2">Qty</th>
                    <th scope="col" className="pb-2">Price/kg</th>
                    <th scope="col" className="pb-2 font-medium">Premium</th>
                    <th scope="col" className="pb-2 text-right">Total Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-55 font-sans text-gray-655">
                  {mockSettlements.map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-mono text-xs text-charcoal">{s.poolId}</td>
                      <td className="py-2.5">
                        <span className="bg-soil-brown/10 text-soil-brown font-semibold text-[10px] uppercase px-2 py-0.5 rounded">
                          {s.crop}
                        </span>
                      </td>
                      <td className="py-2.5">{s.qtyKg} kg</td>
                      <td className="py-2.5">₹{s.pricePerKg}</td>
                      <td className="py-2.5">
                        <span className="bg-field-green/10 text-field-green font-bold text-[10px] px-1.5 py-0.5 rounded">
                          +{s.premiumPct}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-field-green">₹{s.totalEarnings}</td>
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
        </div>
      </main>
    </div>
  );
}
