"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { CheckCircle, BarChart2, IndianRupee, AlertCircle } from "lucide-react";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";

interface BuyerCallRecord {
  poolId: string;
  date: string;
  crop: string;
  district: string;
  bid: number;
  result: "won" | "lost" | "no_answer" | "pending";
  lotQtyKg: number;
}

interface SettlementRow {
  poolId: number;
  crop: string;
  location: string;
  qtyKg: number;
  pricePerKg: number;
  totalAmount: number;
  date: string;
}

export default function BuyerSettlementsPage() {
  const router = useRouter();
  const { isLoggedIn, currentBuyer } = useBuyerSessionStore();

  const [settlements, setSettlements] = useState<SettlementRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [isLoggedIn, router]);

  const fetchSettlements = async () => {
    if (!currentBuyer) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/buyers/${currentBuyer.buyer_id}/calls`
      );
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data: BuyerCallRecord[] = await res.json();
      setSettlements(
        data
          .filter((c) => c.result === "won")
          .map((c) => ({
            poolId: Number(c.poolId.replace(/^POOL-/, "")),
            crop: c.crop,
            location: c.district,
            qtyKg: c.lotQtyKg,
            pricePerKg: c.bid,
            totalAmount: Math.round(c.bid * c.lotQtyKg * 100) / 100,
            date: c.date,
          }))
      );
    } catch (err) {
      console.error("Failed to load settlements:", err);
      setError("Could not load settlements from backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentBuyer) {
      fetchSettlements();
    }
  }, [isLoggedIn, currentBuyer]);

  if (!isLoggedIn) {
    return null;
  }

  // Calculate stats
  const totalSettledCount = settlements.length;
  const totalVolume = settlements.reduce((sum, item) => sum + item.qtyKg, 0);
  const totalValue = settlements.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleRowClick = (poolId: number) => {
    router.push(`/buyer/pool/${poolId}`);
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title="Settlements"
        subtitle="Completed auctions and payment records"
      />

      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-field-green/10 text-field-green flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Total Settled Pools
              </div>
              <div className="font-display font-bold text-2xl text-charcoal">
                {totalSettledCount}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-soil-brown/10 text-soil-brown flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Total Pool Volume
              </div>
              <div className="font-display font-bold text-2xl text-charcoal">
                {totalVolume.toLocaleString()} kg
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-harvest-gold/10 text-harvest-gold flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Total Value Settled
              </div>
              <div className="font-display font-bold text-2xl text-charcoal">
                ₹{totalValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* SETTLEMENTS TABLE */}
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
            <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
            <h3 className="font-sans font-semibold text-sm text-red-600">
              Could not load settlements
            </h3>
            <p className="font-sans text-xs text-gray-400 mt-1">
              Make sure the backend is running
            </p>
            <button
              onClick={fetchSettlements}
              className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-50 rounded w-2/3" />
          </div>
        ) : settlements.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center text-center shadow-sm">
            <CheckCircle className="w-8 h-8 text-gray-300" />
            <h3 className="font-display font-semibold text-sm text-gray-500 mt-3">
              No settlements yet
            </h3>
            <p className="font-sans text-xs text-gray-500 mt-1">
              Won auctions will appear here once pools are settled
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
                      Pool Volume
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                      Price/kg
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {settlements.map((settlement, idx) => (
                    <tr
                      key={idx}
                      onClick={() => handleRowClick(settlement.poolId)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-xs font-semibold text-charcoal">
                        Pool #{settlement.poolId}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-charcoal capitalize">
                        {settlement.crop}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500 capitalize">
                        {settlement.location}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-charcoal">
                        {settlement.qtyKg} kg
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-field-green">
                        ₹{settlement.pricePerKg.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-charcoal">
                        ₹{settlement.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-450 font-mono">
                        {settlement.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-sans text-[11px] text-gray-400 text-center">
              Pool Volume reflects the total settled pool quantity, not a per-buyer allocation breakdown — the backend does not currently expose per-buyer allocated quantity on this endpoint.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
