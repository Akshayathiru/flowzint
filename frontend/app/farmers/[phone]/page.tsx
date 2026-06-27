"use client";

// TODO: replace with useQuery('/api/farmers/' + phone)

import React from "react";
import Link from "next/link";
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

interface PageProps {
  params: {
    phone: string;
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

export default function FarmerProfilePage({ params }: PageProps) {
  const phoneParam = decodeURIComponent(params.phone || mockProfile.phone);

  const getScoreColorClass = (score: number) => {
    if (score >= 3.5) return "text-field-green";
    if (score >= 2.0) return "text-amber-600";
    return "text-alert-red";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 3.5) return "High Trust";
    if (score >= 2.0) return "Medium Trust";
    return "Low Trust";
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      {/* PAGE HEADER */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Link
              href="/farmers"
              className="flex items-center gap-1 text-gray-400 hover:text-charcoal font-sans text-sm transition-colors font-medium"
            >
              <ChevronLeft size={16} />
              <span>Farmers</span>
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
              <div className="flex items-center gap-1.5 font-sans text-xs text-gray-400 mt-1.5 font-medium">
                <LanguageBadge code={mockProfile.language} />
                <span>&middot;</span>
                <span>{mockProfile.district}</span>
              </div>
              <span className="font-sans text-[11px] text-gray-400 mt-1">
                First call: {mockProfile.firstCall}
              </span>
              <div className="mt-3">
                <LanguageBadge code={mockProfile.language} />
              </div>
            </div>

            {/* Col 2 — Trust Score */}
            <div className="flex flex-col items-start pt-4 lg:pt-0 lg:pl-6 pb-4 md:pb-0">
              <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-gray-400">
                Trust Score
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className={`font-display font-extrabold text-4xl ${getScoreColorClass(
                    mockProfile.trustScore
                  )}`}
                >
                  {mockProfile.trustScore}
                </span>
                <span className="font-sans text-xs text-gray-400">/ 5.0</span>
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
                <span>{mockProfile.totalCalls} total calls</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-sans font-medium">
                <Package className="w-4.5 h-4.5 text-gray-400" />
                <span>{mockProfile.totalQtySold} kg total sold</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-sans font-medium">
                <BarChart2 className="w-4.5 h-4.5 text-gray-400" />
                <span>{mockProfile.averageQtyPerCall} kg avg per call</span>
              </div>
            </div>

            {/* Col 4 — Trust Factors */}
            <div className="flex flex-col items-start pt-4 lg:pt-0 lg:pl-6 gap-2">
              <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Trust Factors
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                <CheckCircle className="w-4 h-4 text-field-green" />
                <span>
                  {mockProfile.trustFactors.confirmedDeliveries} confirmed
                  deliveries
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                <XCircle className="w-4 h-4 text-alert-red" />
                <span>{mockProfile.trustFactors.noShows} no-show</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-sans font-medium">
                <Phone className="w-4 h-4 text-sky-blue" />
                <span>
                  {mockProfile.trustFactors.confirmedCallbacks} confirmed
                  callbacks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: TRUST SCORE EXPLAINER */}
        <div className="w-full">
          <TrustScoreExplainer />
        </div>

        {/* ROW 3: POOL HISTORY TIMELINE */}
        <div className="w-full">
          <FarmerCallTimeline />
        </div>
      </main>
    </div>
  );
}
