"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import PoolMetricsPanel from "@/components/pool/PoolMetricsPanel";
import PriceSparkline from "@/components/charts/PriceSparkline";
import FarmerTable from "@/components/farmers/FarmerTable";
import { BuyerAuctionLog } from "@/components/pool/BuyerAuctionLog";
import SettlementReceiptPreview from "@/components/shared/SettlementReceiptPreview";

interface PageProps {
  params: {
    poolId: string;
    locale: string;
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
              className="flex items-center gap-1 text-gray-500 hover:text-charcoal font-sans text-sm transition-colors font-medium"
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

        {/* ROW 2: FARMER TABLE & BUYER AUCTION LOG */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="flex flex-col gap-6">
            <FarmerTable />
          </div>
          <div className="flex flex-col gap-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 mb-2">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Buyer Auction Log
              </span>
              <span className="font-sans text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded">
                Bulbul Outbound IVR
              </span>
            </div>
            <BuyerAuctionLog entries={[
              { buyerName: "Buyer C (Murugan Agro)", phone: "+91 98XXX 20003", callStatus: "no_answer", bid: null, timestamp: "09:45:30" },
              { buyerName: "Buyer A (Ramesh Traders)", phone: "+91 80XXX 20001", callStatus: "completed", bid: 14, timestamp: "09:46:12" },
              { buyerName: "Buyer B (Sri Lakshmi)", phone: "+91 79XXX 20002", callStatus: "completed", bid: 15, timestamp: "09:46:38", isWinning: true }
            ]} />
          </div>
        </div>

        {/* ROW 3: SETTLEMENT RECEIPT PREVIEW */}
        <div className="w-full">
          <SettlementReceiptPreview />
        </div>
      </main>
    </div>
  );
}
