"use client";

import React, { useEffect } from "react";
import { useRouter, Link } from "@/lib/navigation";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { useBuyerAuctions } from "@/hooks/useBuyerAuctions";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";

import { AuctionPool } from "@/types";

export default function BuyerBidsPage() {
  const router = useRouter();
  const { currentBuyer, isLoggedIn, bidHistory } = useBuyerSessionStore();
  const { data } = useBuyerAuctions();
  const activePools = data?.data || [];

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn || !currentBuyer) {
      router.push("/login");
    }
  }, [isLoggedIn, currentBuyer, router]);

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
        title="My Bid History"
        subtitle="All bids you've placed across auctions"
      />

      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {bidHistory.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm max-w-2xl mx-auto">
            <p className="font-sans text-sm text-gray-400 font-semibold">
              No bids yet
            </p>
            <p className="font-sans text-xs text-gray-300 mt-1 font-medium mb-4">
              Head to Live Auctions to place your first bid
            </p>
            <Link
              href="/buyer/auctions"
              className="inline-flex items-center justify-center bg-charcoal text-white rounded-lg px-4 py-2 font-sans font-medium text-xs hover:bg-gray-800 transition-colors cursor-pointer"
            >
              View Live Auctions
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <caption className="sr-only">List of your submitted bids</caption>
                <thead>
                  <tr className="border-b border-gray-150">
                    <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Pool ID
                    </th>
                    <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Crop
                    </th>
                    <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Location
                    </th>
                    <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Price
                    </th>
                    <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Quantity
                    </th>
                    <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Time
                    </th>
                    <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      Pool Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bidHistory.map((bid, index) => {
                    const status = getPoolStatus(bid.pool_id);
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        {/* Pool ID */}
                        <td className="py-3.5 font-mono text-xs text-charcoal font-medium">
                          Pool #{bid.pool_id}
                        </td>

                        {/* Crop */}
                        <td className="py-3.5 text-xs text-charcoal font-semibold capitalize">
                          {bid.crop}
                        </td>

                        {/* Location */}
                        <td className="py-3.5 text-xs text-gray-500 font-medium capitalize">
                          {bid.location}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 text-xs text-charcoal font-bold font-mono">
                          ₹{bid.price}/kg
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 text-xs text-charcoal font-medium font-mono">
                          {bid.quantity}kg
                        </td>

                        {/* Time */}
                        <td className="py-3.5 text-xs text-gray-400 font-medium">
                          {new Date(bid.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5">
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
