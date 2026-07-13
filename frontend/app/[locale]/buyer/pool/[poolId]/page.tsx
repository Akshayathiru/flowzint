"use client";

import React, { useEffect, useState } from "react";
import { Link, useRouter } from "@/lib/navigation";
import { ChevronLeft, Loader2, Users, Calendar, Compass, Shield, AlertCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { buyerApi } from "@/lib/buyerApi";
import { toast } from "sonner";
import LanguageBadge from "@/components/shared/LanguageBadge";
import { useTranslations } from "next-intl";

interface PageProps {
  params: {
    poolId: string;
    locale: string;
  };
}

export default function BuyerPoolDetailPage({ params }: PageProps) {
  const router = useRouter();
  const poolId = parseInt(params.poolId);
  const { isLoggedIn, currentBuyer, addBid, bidHistory, hasHydrated } = useBuyerSessionStore();
  const t = useTranslations("poolDetail");
  const tAuc = useTranslations("buyerAuctions");
  const tDash = useTranslations("farmerDashboard");

  const [pool, setPool] = useState<any | null>(null);
  const [poolLoading, setPoolLoading] = useState(true);
  const [poolError, setPoolError] = useState<string | null>(null);

  const [farmers, setFarmers] = useState<any[]>([]);
  const [farmersLoading, setFarmersLoading] = useState(true);
  const [farmersError, setFarmersError] = useState(false);

  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  // Auth guard
  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [hasHydrated, isLoggedIn, router]);

  // Load pool data
  const fetchPoolData = () => {
    setPoolLoading(true);
    setPoolError(null);
    buyerApi.getActivePools()
      .then(({ data, offline }) => {
        if (offline) {
          throw new Error("Could not connect to real backend API");
        }
        const foundPool = data.find((p) => p.pool_id === poolId);
        if (foundPool) {
          setPool(foundPool);
        } else {
          setPoolError("Pool not found");
        }
      })
      .catch((err) => {
        console.error("Failed to load pool detail:", err);
        setPoolError(err.message || "Could not load pool details");
      })
      .finally(() => {
        setPoolLoading(false);
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchPoolData();
    }
  }, [poolId, isLoggedIn]);

  // Load pool farmers list
  useEffect(() => {
    if (isLoggedIn) {
      setFarmersLoading(true);
      setFarmersError(false);
      buyerApi.getPoolFarmers(poolId)
        .then(({ data, offline }) => {
          if (offline) {
            throw new Error("Could not connect to real backend API");
          }
          setFarmers(data || []);
        })
        .catch((err) => {
          console.error("Failed to load pool farmers:", err);
          setFarmersError(true);
        })
        .finally(() => {
          setFarmersLoading(false);
        });
    }
  }, [poolId, isLoggedIn]);

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

  if (poolError) {
    return (
      <div className="min-h-screen bg-warm-cream flex flex-col items-center justify-center font-sans p-6">
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
          <h3 className="font-sans font-semibold text-sm text-red-600">
            {t("error_title")}
          </h3>
          <p className="font-sans text-xs text-gray-400 mt-1">
            Make sure the backend is running
          </p>
          <button
            onClick={fetchPoolData}
            className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm cursor-pointer"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (poolLoading || !pool) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-soil-brown" />
      </div>
    );
  }

  const isExpired = timeLeftMs <= 0;
  const isBiddingDisabled = pool.auctionClosed || pool.status !== "auctioning" || isExpired;

  const getTimerColorClass = () => {
    if (isExpired) return "text-gray-400 line-through";
    const totalMins = timeLeftMs / 1000 / 60;
    if (totalMins <= 1) return "text-alert-red font-bold animate-pulse";
    if (totalMins <= 5) return "text-harvest-gold font-semibold";
    return "text-charcoal font-bold";
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return tAuc("auction_closed");
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return tAuc("remaining", { time: `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}` });
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

      toast.success(tAuc("bid_success", { price: parsedPrice, quantity: parsedQty }));
      setPrice("");
      setQuantity("");
    } catch (err: any) {
      toast.error(err.message || tAuc("bid_error"));
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
              <span>{t("back_to_auctions")}</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-base text-charcoal font-mono">
              {t("pool_number", { id: pool.pool_id })}
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
                  <span className={`text-sm font-mono transition-all duration-150 ${getTimerColorClass()}`}>
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
                  <span>{tAuc("farmers_pooled", { count: pool.farmers_count })}</span>
                </div>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4 border-l border-gray-100 pl-4 min-w-[200px]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[9px] text-gray-455 block font-bold uppercase">{t("quick_stats_farmers")}</span>
                  <span className="text-xs font-semibold text-charcoal">{pool.farmers_count}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[9px] text-gray-455 block font-bold uppercase">{t("quick_stats_timeline")}</span>
                  <span className="text-xs font-semibold text-charcoal">{t("timeline_value")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[9px] text-gray-450 block font-bold uppercase">{t("quick_stats_district")}</span>
                  <span className="text-xs font-semibold text-charcoal capitalize">{pool.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-[9px] text-gray-455 block font-bold uppercase">{t("quick_stats_assurance")}</span>
                  <span className="text-xs font-semibold text-charcoal">{t("assurance_value")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BID SECTION */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-display font-semibold text-base text-charcoal mb-4">
            {t("auction_bidding")}
          </h3>

          {isBiddingDisabled ? (
            <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-500 italic text-center">
              {pool.status === "settled" ? (
                <div>
                  <span className="font-bold text-field-green not-italic block text-sm mb-1">
                    {t("settled_info")}
                  </span>
                  Allocated to winning bidder at <span className="font-bold text-charcoal">₹12.00/kg</span> for <span className="font-bold text-charcoal">500kg</span> lot.
                </div>
              ) : (
                tAuc("bidding_closed")
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
                    placeholder={tAuc("price_placeholder")}
                    className="w-full pl-6 pr-8 border border-gray-200 rounded-lg py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 font-sans bg-white text-charcoal"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 font-sans text-xs">
                    {tAuc("per_kg")}
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
                    placeholder={tAuc("qty_placeholder")}
                    className="w-full pr-8 pl-3 border border-gray-200 rounded-lg py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 font-sans bg-white text-charcoal"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 font-sans text-xs">
                    {tAuc("kg")}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-harvest-gold text-soil-brown font-sans font-semibold text-xs rounded-lg px-6 py-3 hover:brightness-95 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-sm min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      {tAuc("placing")}
                    </>
                  ) : (
                    tAuc("place_bid")
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Previous Bids */}
          {poolBids.length > 0 && (
            <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
              <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-3">
                {tAuc("your_bids")}
              </span>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                {poolBids.map((bid, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-55 last:border-0">
                    <span className="font-sans text-xs text-gray-655 font-semibold">
                      ₹{bid.price.toFixed(2)}/kg for {bid.quantity}kg
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-xs text-gray-400 font-mono">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="bg-sky-blue/10 text-sky-blue text-[9px] font-bold rounded px-1.5 py-0.5 uppercase tracking-wide">
                        {tAuc("submitted")}
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
            {t("farmers_in_pool")}
          </h3>

          {farmersLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-gray-400 gap-2 font-sans">
              <Loader2 className="w-4 h-4 animate-spin text-soil-brown" />
              <span>{tDash("loading_farmers")}</span>
            </div>
          ) : farmersError ? (
            <div className="py-6 text-center text-xs text-alert-red font-sans">
              {t("no_farmers")}
            </div>
          ) : farmers.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400 font-sans italic">
              No farmers found in this pool.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 font-medium uppercase tracking-widest text-[10px]">
                    <th scope="col" className="px-4 py-3">{t("phone")}</th>
                    <th scope="col" className="px-4 py-3">{t("quantity")} (kg)</th>
                    <th scope="col" className="px-4 py-3">{t("call_time")}</th>
                    <th scope="col" className="px-4 py-3">{t("language")}</th>
                    <th scope="col" className="px-4 py-3">{t("trust_score")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-655">
                  {farmers.map((farmer, idx) => {
                    const scoreColor = farmer.trust_score >= 3.5
                      ? "text-field-green"
                      : farmer.trust_score >= 2.0
                      ? "text-harvest-gold"
                      : "text-alert-red";

                    const dateObj = new Date(farmer.call_time);
                    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isToday = dateObj.toDateString() === new Date().toDateString();
                    const callTimeDisplay = isToday ? `Today ${formattedTime}` : dateObj.toLocaleDateString([], { month: "short", day: "numeric" });

                    return (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono text-sky-blue">{farmer.phone}</td>
                        <td className="px-4 py-3 font-semibold text-charcoal">{farmer.quantity_kg} kg</td>
                        <td className="px-4 py-3 font-mono text-gray-400">{callTimeDisplay}</td>
                        <td className="px-4 py-3">
                          <LanguageBadge code={farmer.language} />
                        </td>
                        <td className={`px-4 py-3 font-semibold font-display ${scoreColor}`}>★ {farmer.trust_score.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
