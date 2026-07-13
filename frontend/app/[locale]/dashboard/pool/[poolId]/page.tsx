"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { ChevronLeft, AlertCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import PoolMetricsPanel from "@/components/pool/PoolMetricsPanel";
import PriceSparkline from "@/components/charts/PriceSparkline";
import FarmerTable, { PoolFarmerRow } from "@/components/farmers/FarmerTable";
import { BuyerAuctionLog } from "@/components/pool/BuyerAuctionLog";
import SettlementReceiptPreview from "@/components/shared/SettlementReceiptPreview";

interface PageProps {
  params: {
    poolId: string;
    locale: string;
  };
}

interface ActivePoolResponse {
  poolId: string;
  crop: string;
  location: string;
  currentQtyKg: number;
  targetQtyKg: number;
  farmersCount: number;
  status: string;
  auctionEndTime: string | null;
  auctionClosed: boolean;
}

interface SettledPoolResponse {
  poolId: string;
  crop: string;
  location: string;
  totalQtyKg: number;
  farmersCount: number;
  winningPricePerKg: number;
  buyerName: string;
  buyerPhone: string;
  buyerStatus: string;
  settledAt: string | null;
  status: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function PoolDetailPage({ params }: PageProps) {
  const { poolId } = params;

  const [activePool, setActivePool] = useState<ActivePoolResponse | null>(null);
  const [settledPool, setSettledPool] = useState<SettledPoolResponse | null>(null);
  const [farmers, setFarmers] = useState<PoolFarmerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPool = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [activeRes, settledRes, farmersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/active`),
        fetch(`${BACKEND_URL}/settlements`),
        fetch(`${BACKEND_URL}/pool/${poolId}/farmers`),
      ]);

      const activePools: ActivePoolResponse[] = activeRes.ok
        ? await activeRes.json()
        : [];
      const settledPools: SettledPoolResponse[] = settledRes.ok
        ? await settledRes.json()
        : [];
      const poolFarmers: PoolFarmerRow[] = farmersRes.ok
        ? await farmersRes.json()
        : [];

      // /active only returns OPEN/AUCTION/CLOSED pools (not SETTLED), so a
      // settled pool like Pool 1 must be looked up via /settlements instead.
      const settled = settledPools.find(
        (p) => String(p.poolId) === String(poolId)
      );
      const active = activePools.find(
        (p) => String(p.poolId) === String(poolId)
      );

      if (settled) {
        setSettledPool(settled);
        setActivePool(null);
      } else if (active) {
        setActivePool(active);
        setSettledPool(null);
      } else {
        setActivePool(null);
        setSettledPool(null);
        setError("Pool not found");
      }
      setFarmers(poolFarmers);
    } catch (err) {
      console.error("Failed to load pool:", err);
      setError("Could not load pool from backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolId]);

  if (error) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center font-sans">
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-xl max-w-md text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
          <h3 className="font-sans font-semibold text-sm text-red-600">
            Could not load pool
          </h3>
          <p className="font-sans text-xs text-gray-400 mt-1">{error}</p>
          <button
            onClick={fetchPool}
            className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || (!activePool && !settledPool)) {
    return (
      <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
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
                Loading&hellip;
              </span>
            </div>
          }
          subtitle=""
        />
      </div>
    );
  }

  const crop = settledPool ? settledPool.crop : activePool!.crop;
  const location = settledPool ? settledPool.location : activePool!.location;
  const farmersCount = settledPool
    ? settledPool.farmersCount
    : activePool!.farmersCount;
  const totalQuantity = settledPool
    ? settledPool.totalQtyKg
    : activePool!.currentQtyKg;
  const status = settledPool ? "settled" : activePool!.status;
  const winningPrice = settledPool ? settledPool.winningPricePerKg : null;
  const auctionEndTime = settledPool ? null : activePool!.auctionEndTime;

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
              Pool #{poolId}
            </span>
          </div>
        }
        subtitle={`${crop} · ${location}`}
        actions={<StatusBadge status={status as "filling" | "closed" | "auctioning" | "settled" | "expired"} />}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* ROW 1: METRICS + PRICE CHART */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PoolMetricsPanel
            crop={crop}
            location={location}
            totalQuantity={totalQuantity}
            farmersCount={farmersCount}
            status={status}
            winningPrice={winningPrice}
            auctionEndTime={auctionEndTime}
          />
          <PriceSparkline />
        </div>

        {/* ROW 1.5: SETTLEMENT INFO (only for settled pools) */}
        {settledPool && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 mb-3">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Settlement
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
              <div>
                <span className="text-gray-500 block">Winning Buyer(s)</span>
                <span className="font-semibold text-charcoal">{settledPool.buyerName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Price</span>
                <span className="font-semibold text-field-green">₹{settledPool.winningPricePerKg}/kg</span>
              </div>
              <div>
                <span className="text-gray-500 block">Delivery Status</span>
                <span className="font-semibold text-charcoal capitalize">
                  {settledPool.buyerStatus.toLowerCase()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Settled At</span>
                <span className="font-mono text-[11px] text-charcoal">
                  {settledPool.settledAt
                    ? new Date(settledPool.settledAt).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ROW 2: FARMER TABLE & BUYER AUCTION LOG */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="flex flex-col gap-6">
            <FarmerTable farmers={farmers} />
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
