"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { CheckCircle, BarChart2, IndianRupee } from "lucide-react";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";

const MOCK_SETTLEMENTS = [
  {
    poolId: 3,
    crop: "Potatoes",
    location: "Chengalpattu",
    qtyKg: 500,
    pricePerKg: 12.0,
    totalAmount: 6000,
    date: "10 Jul 2026",
  },
  {
    poolId: 10,
    crop: "Tomatoes",
    location: "Kanchipuram",
    qtyKg: 1000,
    pricePerKg: 15.5,
    totalAmount: 15500,
    date: "03 Jul 2026",
  },
  {
    poolId: 14,
    crop: "Onions",
    location: "Vellore",
    qtyKg: 700,
    pricePerKg: 10.0,
    totalAmount: 7000,
    date: "28 Jun 2026",
  },
];

export default function BuyerSettlementsPage() {
  const router = useRouter();
  const { isLoggedIn } = useBuyerSessionStore();

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  // Calculate stats
  const totalSettledCount = MOCK_SETTLEMENTS.length;
  const totalVolume = MOCK_SETTLEMENTS.reduce((sum, item) => sum + item.qtyKg, 0);
  const totalValue = MOCK_SETTLEMENTS.reduce((sum, item) => sum + item.totalAmount, 0);

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
                Total Volume Allocated
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
                  Allocated Qty
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
              {MOCK_SETTLEMENTS.map((settlement, idx) => (
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
      </main>
    </div>
  );
}
