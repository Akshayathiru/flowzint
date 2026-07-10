"use client";

import React, { useEffect, useState } from "react";
import { Link, useRouter } from "@/lib/navigation";
import { ChevronLeft, Loader2, Users, Calendar, Compass, Shield } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { MOCK_AUCTION_POOLS } from "@/lib/buyerMockData";
import { buyerApi } from "@/lib/buyerApi";
import { toast } from "sonner";
import LanguageBadge from "@/components/shared/LanguageBadge";

interface PageProps {
  params: {
    poolId: string;
    locale: string;
  };
}

// Mock farmers list for pools
const MOCK_POOL_FARMERS = [
  { phone: "+91 98XXX 10001", quantity: 80, time: "09:47", language: "ta", trust: 4.2 },
  { phone: "+91 97XXX 10002", quantity: 350, time: "09:44", language: "te", trust: 3.8 },
  { phone: "+91 95XXX 10004", quantity: 220, time: "08:30", language: "ta", trust: 2.9 },
  { phone: "+91 94XXX 10005", quantity: 60, time: "07:15", language: "ta", trust: 1.8 },
  { phone: "+91 91XXX 10008", quantity: 90, time: "Yesterday", language: "hi", trust: 2.3 },
];

export default function BuyerPoolDetailPage({ params }: PageProps) {
  const router = useRouter();
  const poolId = parseInt(params.poolId);
  const { isLoggedIn, currentBuyer, addBid, bidHistory } = useBuyerSessionStore();

  const [pool, setPool] = useState<typeof MOCK_AUCTION_POOLS[0] | null>(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [isLoggedIn, router]);

  // Load pool data
  useEffect(() => {
    const foundPool = MOCK_AUCTION_POOLS.find((p) => p.pool_id === poolId);
    if (foundPool) {
      setPool(foundPool);
    }
  }, [poolId]);

  // Timer logic
  useEffect(() => {
    if (!pool || !pool.auctionEndTime || pool.auctionClosed || pool.status !== "auctioning") {
      setTimeLeftMs(0);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(pool.auctionEndTime!).getTime() - Date.now();
      setTimeLeftMs(Math.max(0, difference));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [pool]);

  if (!isLoggedIn || !currentBuyer) {
    return null;
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-soil-brown" />
      </div>
    );
  }

  const isExpired = timeLeftMs <= 0;
  const isBiddingDisabled = pool.auctionClosed || pool.status !== "auctioning" || isExpired;

  const formatTime = (ms: number) => {
    if (ms <= 0) return "Auction Closed";
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} remaining`;
  };

  const percent = pool.target_qty_kg > 0 ? (pool.current_qty_kg / pool.target_qty_kg) * 100 : 0;
  const percentage = Math.min(Math.round(percent), 100);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBiddingDisabled) return;

    const parsedPrice = parseFloat(price);
    const parsedQty = parseFloat(quantity);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      toast.error("Please enter a valid quantity greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: replace with API call
      await buyerApi.submitBid({
        buyer_id: currentBuyer.buyer_id,
        pool_id: pool.pool_id,
        price: parsedPrice,
        quantity: parsedQty,
      });

      addBid({
        pool_id: pool.pool_id,
        price: parsedPrice,
        quantity: parsedQty,
        timestamp: new Date().toISOString(),
        crop: pool.crop,
        location: pool.location,
      });

      toast.success(`Bid placed — ₹${parsedPrice}/kg for ${parsedQty}kg`);
      setPrice("");
      setQuantity("");
    } catch (err: any) {
      toast.error(err.message || "Failed to place bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  const poolBids = bidHistory.filter((b) => b.pool_id === pool.pool_id);

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Link
              href="/buyer/auctions"
              className="flex items-center gap-1 text-gray-500 hover:text-charcoal font-sans text-sm transition-colors font-medium"
            >
              <ChevronLeft size={16} />
              <span>Auctions</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-base text-charcoal">
              Pool #{pool.pool_id}
            </span>
          </div>
        }
        subtitle={`${pool.crop} · ${pool.location}`}
      />

      <main className="max-w-4xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* POOL OVERVIEW */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-4 flex-1 min-w-[250px]">
              <div className="flex items-center gap-4">
                <StatusBadge status={pool.status as any} />
                {pool.status === "auctioning" && (
                  <span className="text-xs text-alert-red font-bold font-mono animate-pulse">
                    ⏱ {formatTime(timeLeftMs)}
                  </span>
                )}
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
                  <span>Current: {pool.current_qty_kg} kg</span>
                  <span>Target: {pool.target_qty_kg} kg</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-field-green transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{percentage}% complete</span>
                  <span>{pool.farmers_count} farmers pooled</span>
                </div>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4 border-l border-gray-100 pl-4 min-w-[200px]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[9px] text-gray-450 block font-bold uppercase">Farmers</span>
                  <span className="text-xs font-semibold text-charcoal">{pool.farmers_count}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[9px] text-gray-455 block font-bold uppercase">Timeline</span>
                  <span className="text-xs font-semibold text-charcoal">90 Minutes</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[9px] text-gray-450 block font-bold uppercase">District</span>
                  <span className="text-xs font-semibold text-charcoal capitalize">{pool.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[9px] text-gray-455 block font-bold uppercase">Assurance</span>
                  <span className="text-xs font-semibold text-charcoal">FPO Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BID SECTION */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-display font-semibold text-base text-charcoal mb-4">
            Auction Bidding
          </h3>

          {isBiddingDisabled ? (
            <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-500 italic text-center">
              {pool.status === "settled" ? (
                <div>
                  <span className="font-bold text-field-green not-italic block text-sm mb-1">
                    Auction Settled Successfully
                  </span>
                  Allocated to winning bidder at <span className="font-bold text-charcoal">₹12.00/kg</span> for <span className="font-bold text-charcoal">500kg</span> lot.
                </div>
              ) : (
                "Bidding is currently closed for this pool."
              )}
            </div>
          ) : (
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative rounded-lg shadow-sm w-40">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-mono text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price per kg"
                    className="w-full pl-6 pr-8 border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 font-sans bg-white text-charcoal"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 font-sans text-xs">
                    /kg
                  </span>
                </div>

                <div className="relative rounded-lg shadow-sm w-40">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Quantity"
                    className="w-full pr-8 pl-3 border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 font-sans bg-white text-charcoal"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 font-sans text-xs">
                    kg
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-harvest-gold text-soil-brown font-sans font-semibold text-xs rounded-lg px-6 py-3 hover:brightness-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      Submitting Bid...
                    </>
                  ) : (
                    "Submit Live Bid"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Previous Bids */}
          {poolBids.length > 0 && (
            <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
              <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-3">
                Your Bids for this Pool
              </span>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                {poolBids.map((bid, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                    <span className="font-sans text-xs text-gray-655 font-semibold">
                      ₹{bid.price.toFixed(2)}/kg for {bid.quantity}kg
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-xs text-gray-400 font-mono">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="bg-sky-blue/10 text-sky-blue text-[9px] font-bold rounded px-1.5 py-0.5 uppercase tracking-wide">
                        Received
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FARMERS IN THIS POOL */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-display font-semibold text-base text-charcoal mb-4">
            Farmers in this Pool
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold">
                  <th scope="col" className="px-4 py-2.5">Phone Number</th>
                  <th scope="col" className="px-4 py-2.5">Quantity (kg)</th>
                  <th scope="col" className="px-4 py-2.5">Call Time</th>
                  <th scope="col" className="px-4 py-2.5">Language</th>
                  <th scope="col" className="px-4 py-2.5">Trust Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-655">
                {MOCK_POOL_FARMERS.map((farmer, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-charcoal">{farmer.phone}</td>
                    <td className="px-4 py-3 font-semibold text-charcoal">{farmer.quantity} kg</td>
                    <td className="px-4 py-3 font-mono text-gray-400">{farmer.time}</td>
                    <td className="px-4 py-3">
                      <LanguageBadge code={farmer.language} />
                    </td>
                    <td className="px-4 py-3 font-semibold font-display text-soil-brown">{farmer.trust.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
