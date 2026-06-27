"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import PoolMetricsPanel from "@/components/pool/PoolMetricsPanel";
import PriceSparkline from "@/components/charts/PriceSparkline";
import FarmerTable from "@/components/farmers/FarmerTable";
import SettlementReceiptPreview from "@/components/shared/SettlementReceiptPreview";

interface PageProps {
  params: {
    poolId: string;
  };
}

export default function PoolDetailPage({ params }: PageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayPoolId = params.poolId || "KAN-TOM-001";

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      {/* PAGE HEADER */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-gray-400 hover:text-charcoal font-sans text-sm transition-colors font-medium"
            >
              <ChevronLeft size={16} />
              <span>Dashboard</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-display font-bold text-xl text-charcoal">
              {displayPoolId}
            </span>
          </div>
        }
        subtitle="Tomatoes · Kanchipuram"
        actions={<StatusBadge status="auctioning" />}
      />

      {/* Main Content Area */}
      <main
        className={`max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6 transition-opacity duration-300 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >

        {/* ROW 1: METRICS + PRICE CHART */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PoolMetricsPanel />
          <PriceSparkline />
        </div>

        {/* ROW 2: FARMER TABLE */}
        <div className="w-full">
          <FarmerTable />
        </div>

        {/* ROW 3: SETTLEMENT RECEIPT PREVIEW */}
        <div className="w-full">
          <SettlementReceiptPreview />
        </div>
      </main>
    </div>
  );
}
