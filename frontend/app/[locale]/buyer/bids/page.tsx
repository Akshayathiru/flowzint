"use client";

import React, { useEffect } from "react";
import { useRouter, Link } from "@/lib/navigation";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { useBuyerAuctions } from "@/hooks/useBuyerAuctions";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

import { AuctionPool } from "@/types";

export default function BuyerBidsPage() {
  const router = useRouter();
  const { currentBuyer, isLoggedIn, bidHistory, hasHydrated } = useBuyerSessionStore();
  const t = useTranslations("buyerBids");
  const { data } = useBuyerAuctions();
  const activePools = data?.data || [];

  // Auth Guard
  useEffect(() => {
    if (hasHydrated && (!isLoggedIn || !currentBuyer)) {
      router.push("/login");
    }
  }, [hasHydrated, isLoggedIn, currentBuyer, router]);

  if (!isLoggedIn || !currentBuyer) {
    return null;
  }

  // Create helper to map pool status
  const getPoolStatus = (poolId: number) => {
    const active = activePools?.find((p: AuctionPool) => p.pool_id === poolId);
    if (active) return active.status;
    return "settled"; // Default to settled if not found in active pools list
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {bidHistory.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm max-w-2xl mx-auto flex flex-col items-center">
            <FileText className="w-10 h-10 text-gray-300 mb-3" />
            <p className="font-sans text-sm text-gray-500 font-semibold">
              {t("no_bids")}
            </p>
            <p className="font-sans text-xs text-gray-400 mt-1 font-medium mb-4">
              {t("no_bids_hint")}
            </p>
            <Link
              href="/buyer/auctions"
              className="inline-flex items-center justify-center bg-charcoal text-white rounded-lg px-4 py-2 font-sans font-medium text-xs hover:brightness-90 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 cursor-pointer"
            >
              {t("go_to_auctions")}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <caption className="sr-only">List of your submitted bids</caption>
                <thead>
                  <tr className="bg-gray-50/50">
                    <th scope="col" className="py-3 px-1 sm:px-2 text-gray-400 uppercase tracking-widest text-[10px] font-medium">
                      {t("pool")} ID
                    </th>
                    <th scope="col" className="py-3 px-1 sm:px-2 text-gray-400 uppercase tracking-widest text-[10px] font-medium">
                      {t("crop")}
                    </th>
                    <th scope="col" className="py-3 px-1 sm:px-2 text-gray-400 uppercase tracking-widest text-[10px] font-medium">
                      {t("location")}
                    </th>
                    <th scope="col" className="py-3 px-1 sm:px-2 text-gray-400 uppercase tracking-widest text-[10px] font-medium">
                      {t("price")}
                    </th>
                    <th scope="col" className="py-3 px-1 sm:px-2 text-gray-400 uppercase tracking-widest text-[10px] font-medium">
                      {t("quantity")}
                    </th>
                    <th scope="col" className="py-3 px-1 sm:px-2 text-gray-400 uppercase tracking-widest text-[10px] font-medium">
                      {t("time")}
                    </th>
                    <th scope="col" className="py-3 px-1 sm:px-2 text-gray-400 uppercase tracking-widest text-[10px] font-medium">
                      {t("pool")} {t("status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bidHistory.map((bid, index) => {
                    const status = getPoolStatus(bid.pool_id);
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        {/* Pool ID */}
                        <td className="py-3 px-1 sm:px-2 font-mono text-xs text-charcoal font-medium">
                          Pool #{bid.pool_id}
                        </td>

                        {/* Crop */}
                        <td className="py-3 px-1 sm:px-2 text-xs text-charcoal font-semibold capitalize">
                          {bid.crop}
                        </td>

                        {/* Location */}
                        <td className="py-3 px-1 sm:px-2 text-xs text-gray-500 font-medium capitalize">
                          {bid.location}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-1 sm:px-2 text-xs text-charcoal font-bold font-mono">
                          ₹{bid.price}/kg
                        </td>

                        {/* Quantity */}
                        <td className="py-3 px-1 sm:px-2 text-xs text-charcoal font-medium font-mono">
                          {bid.quantity}kg
                        </td>

                        {/* Time */}
                        <td className="py-3 px-1 sm:px-2 text-xs text-gray-400 font-medium">
                          {new Date(bid.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-1 sm:px-2">
                          <StatusBadge status={status as "filling" | "closed" | "auctioning" | "settled" | "expired"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
