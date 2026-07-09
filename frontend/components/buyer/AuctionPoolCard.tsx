"use client";

import React, { useState, useEffect } from "react";
import { AuctionPool } from "@/types";
import { buyerApi } from "@/lib/buyerApi";
import StatusBadge from "@/components/shared/StatusBadge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { Link } from "@/lib/navigation";

interface AuctionPoolCardProps {
  pool: AuctionPool;
  buyerId: number;
  onBidPlaced?: () => void;
}

export default function AuctionPoolCard({
  pool,
  buyerId,
  onBidPlaced,
}: AuctionPoolCardProps) {
  const { addBid, bidHistory } = useBuyerSessionStore();
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time countdown timer
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  useEffect(() => {
    if (!pool.auctionEndTime || pool.auctionClosed || pool.status !== "auctioning") {
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
  }, [pool.auctionEndTime, pool.auctionClosed, pool.status]);

  const isExpired = timeLeftMs <= 0;
  const isBiddingDisabled = pool.auctionClosed || pool.status !== "auctioning" || isExpired;

  // Format time remaining
  const formatTime = (ms: number) => {
    if (ms <= 0) return "Auction Closed";
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `⏱ ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} remaining`;
  };

  // Timer text color styling rules
  const getTimerColorClass = () => {
    if (isExpired) return "text-gray-400";
    const totalMins = timeLeftMs / 1000 / 60;
    if (totalMins <= 1) return "text-alert-red animate-pulse font-bold";
    if (totalMins <= 5) return "text-harvest-gold font-semibold";
    return "text-charcoal";
  };

  const percent = pool.target_qty_kg > 0 ? (pool.current_qty_kg / pool.target_qty_kg) * 100 : 0;
  const percentage = Math.min(
    Math.round(percent),
    100
  );

  const getBarColorClass = () => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getBorderColorClass = () => {
    switch (pool.status) {
      case "auctioning":
        return "border-l-2 border-l-harvest-gold";
      case "settled":
        return "border-l-2 border-l-field-green";
      default:
        return "";
    }
  };

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
      const { offline } = await buyerApi.submitBid({
        buyer_id: buyerId,
        pool_id: pool.pool_id,
        price: parsedPrice,
        quantity: parsedQty,
      });

      // Save locally in Zustand history store
      addBid({
        pool_id: pool.pool_id,
        price: parsedPrice,
        quantity: parsedQty,
        timestamp: new Date().toISOString(),
        crop: pool.crop,
        location: pool.location,
      });

      toast.success(
        offline
          ? `Bid simulated — ₹${parsedPrice}/kg for ${parsedQty}kg (demo mode)`
          : `Bid placed — ₹${parsedPrice}/kg for ${parsedQty}kg`
      );
      setPrice("");
      setQuantity("");
      if (onBidPlaced) onBidPlaced();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to place bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter local bids made for this pool
  const previousBids = bidHistory.filter((b) => b.pool_id === pool.pool_id);

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-all ${getBorderColorClass()}`}
    >
      {/* Top row */}
      <div className="flex justify-between items-start">
        <Link href={`/buyer/pool/${pool.pool_id}`} className="hover:opacity-85 transition-opacity block">
          <span className="font-sans text-[10px] text-gray-400 font-mono">
            Pool #{pool.pool_id}
          </span>
          <h3 className="font-display font-semibold text-lg text-charcoal capitalize">
            {pool.crop}
          </h3>
          <p className="font-sans text-xs text-gray-450 capitalize">
            {pool.location}
          </p>
        </Link>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={pool.status as "filling" | "closed" | "auctioning" | "settled" | "expired"} />
          {pool.status === "auctioning" && (
            <span className={`font-mono text-xs ${getTimerColorClass()}`}>
              {formatTime(timeLeftMs)}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-450 font-sans mb-1.5">
          <span>{pool.current_qty_kg}kg / {pool.target_qty_kg}kg ({Math.round(percent)}%)</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pool.current_qty_kg}
          aria-valuemin={0}
          aria-valuemax={pool.target_qty_kg}
          className="w-full h-2 rounded-full bg-gray-100 overflow-hidden"
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ${getBarColorClass()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="font-sans text-[11px] text-gray-400 mt-2">
          {pool.farmers_count} farmers pooled
        </p>
      </div>

      {/* Bid Section */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        {isBiddingDisabled ? (
          <div className="text-xs text-gray-400 italic">
            Bidding closed for this pool
          </div>
        ) : (
          <form onSubmit={handlePlaceBid} className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative rounded-lg shadow-sm w-32">
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
                  placeholder="Price"
                  className="w-full pl-6 pr-8 border border-gray-200 rounded-lg py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 font-sans bg-white text-charcoal"
                />
                <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 font-sans text-[10px]">
                  /kg
                </span>
              </div>

              <div className="relative rounded-lg shadow-sm w-32">
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Quantity"
                  className="w-full pr-8 pl-3 border border-gray-200 rounded-lg py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 font-sans bg-white text-charcoal"
                />
                <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 font-sans text-[10px]">
                  kg
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-harvest-gold text-soil-brown font-sans font-medium text-xs rounded-lg px-4 py-2.5 hover:brightness-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    Placing...
                  </>
                ) : (
                  "Place Bid"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Previous Bids */}
        {previousBids.length > 0 && (
          <div className="mt-4 pt-3 border-t border-dashed border-gray-100">
            <span className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold block mb-2">
              Your Bids
            </span>
            <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto pr-1">
              {previousBids.map((bid, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5">
                  <span className="font-sans text-xs text-gray-600 font-medium">
                    ₹{bid.price}/kg × {bid.quantity}kg
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[10px] text-gray-400">
                      {new Date(bid.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <span className="bg-sky-blue/10 text-sky-blue text-[9px] font-bold rounded px-1.5 py-0.5 uppercase tracking-wide">
                      Submitted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
