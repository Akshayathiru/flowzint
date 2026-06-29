"use client";

import React, { useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { useBuyerAuctions } from "@/hooks/useBuyerAuctions";
import AuctionPoolCard from "@/components/buyer/AuctionPoolCard";
import PageHeader from "@/components/shared/PageHeader";
import { AuctionPool } from "@/types";
import OfflineBanner from "@/components/shared/OfflineBanner";

export default function BuyerAuctionsPage() {
  const router = useRouter();
  const { currentBuyer, isLoggedIn, setCurrentBuyer } = useBuyerSessionStore();
  
  const { data, isLoading, refetch } = useBuyerAuctions();
  const pools = data?.data || [];
  const offline = data?.offline || false;

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn || !currentBuyer) {
      router.push("/login");
    }
  }, [isLoggedIn, currentBuyer, router]);

  if (!isLoggedIn || !currentBuyer) {
    return null; // Prevents flashing before redirect completes
  }

  const handleLogout = () => {
    setCurrentBuyer(null);
    router.push("/buyer");
  };

  const firstLetter = currentBuyer.name ? currentBuyer.name.charAt(0).toUpperCase() : "B";

  const loggedInBadge = (
    <div className="bg-warm-cream border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 select-none shadow-sm">
      <div className="w-6 h-6 rounded-full bg-[#6B4226] text-white text-[10px] font-bold flex items-center justify-center">
        {firstLetter}
      </div>
      <span className="font-sans text-xs text-charcoal font-medium">
        {currentBuyer.name}
      </span>
      <button
        onClick={handleLogout}
        className="font-sans text-xs text-gray-400 hover:text-alert-red font-semibold cursor-pointer transition-colors border-l border-gray-200 pl-2 ml-1"
      >
        Log out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      <PageHeader
        title="Live Auctions"
        subtitle="Place bids on active pools in your area"
        actions={loggedInBadge}
      />

      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {offline && <OfflineBanner />}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="animate-pulse bg-white border border-gray-200 rounded-xl h-64 p-5 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-2/3">
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                    <div className="h-5 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-full" />
                </div>
                <div className="h-10 bg-gray-100 rounded-lg w-full" />
              </div>
            ))}
          </div>
        )}

        {/* POOL LIST */}
        {!isLoading && (
          <>
            {!pools || pools.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm max-w-2xl mx-auto">
                <p className="font-sans text-sm text-gray-400 font-semibold">
                  No active auctions right now
                </p>
                <p className="font-sans text-xs text-gray-300 mt-1 font-medium">
                  Check back soon — pools form when farmers call in
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pools.map((pool: AuctionPool) => (
                  <AuctionPoolCard
                    key={pool.pool_id}
                    pool={pool}
                    buyerId={currentBuyer.buyer_id}
                    onBidPlaced={refetch}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
