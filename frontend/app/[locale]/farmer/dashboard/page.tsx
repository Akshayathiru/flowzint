"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useFarmerSessionStore } from "@/store/farmerSessionStore";
import StatusBadge from "@/components/shared/StatusBadge";
import LanguageBadge from "@/components/shared/LanguageBadge";
import { farmerApi } from "@/lib/farmerApi";
import { Sprout, PhoneCall, CheckCircle, ArrowRight, X, Star, ShieldAlert, Loader2, AlertCircle } from "lucide-react";

export default function FarmerDashboard() {
  const router = useRouter();
  const { phone, isLoggedIn, hasHydrated } = useFarmerSessionStore();

  const [profile, setProfile] = useState<{
    phone: string;
    name: string | null;
    location: string;
    primary_crop: string;
    trust_score: number;
    total_calls: number;
    total_pools: number;
    total_quantity_kg: number;
    total_earnings: number;
    member_since: string;
  } | null>(null);

  const [pools, setPools] = useState<Array<{
    pool_id: number;
    crop: string;
    location: string;
    status: string;
    current_qty_kg: number;
    target_qty_kg: number;
    farmers_count: number;
    your_contribution_kg: number;
    settled_price_per_kg: number | null;
    mandi_rate_per_kg: number | null;
  }>>([]);

  const [calls, setCalls] = useState<Array<{
    call_id: number;
    timestamp: string;
    crop: string;
    quantity_kg: number;
    location: string;
    language: string;
    pool_id: number | null;
    status: string;
  }>>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callsError, setCallsError] = useState(false);

  // Modal State
  const [selectedPool, setSelectedPool] = useState<{
    pool_id: number;
    crop: string;
    location: string;
    status: string;
    current_qty_kg: number;
    target_qty_kg: number;
    farmers_count: number;
    your_contribution_kg: number;
    settled_price_per_kg: number | null;
    mandi_rate_per_kg: number | null;
  } | null>(null);

  const [modalFarmers, setModalFarmers] = useState<Array<{
    phone: string;
    quantity_kg: number;
    trust_score: number;
    call_time: string;
    language: string;
  }>>([]);
  const [modalFarmersLoading, setModalFarmersLoading] = useState(false);
  const [modalFarmersError, setModalFarmersError] = useState(false);

  // Auth guard
  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.push("/login?role=farmer");
    }
  }, [hasHydrated, isLoggedIn, router]);

  const fetchData = () => {
    if (!phone) return;
    setLoading(true);
    setError(null);
    setCallsError(false);

    Promise.all([
      farmerApi.getProfile(phone),
      farmerApi.getPools(phone),
    ])
      .then(([profileData, poolsData]) => {
        setProfile(profileData);
        setPools(poolsData);
      })
      .catch((err) => {
        console.error("Failed to load farmer dashboard data:", err);
        setError(err.message || "Could not load your data");
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch calls history independently
    farmerApi.getCalls(phone)
      .then((callsData) => {
        setCalls(callsData);
      })
      .catch((err) => {
        console.error("Failed to load call history:", err);
        setCallsError(true);
      });
  };

  useEffect(() => {
    if (isLoggedIn && phone) {
      fetchData();
    }
  }, [phone, isLoggedIn]);

  // Fetch farmers for modal when a pool is selected
  useEffect(() => {
    if (selectedPool) {
      setModalFarmersLoading(true);
      setModalFarmersError(false);
      setModalFarmers([]);
      
      farmerApi.getPoolFarmers(selectedPool.pool_id)
        .then((farmersData) => {
          setModalFarmers(farmersData);
        })
        .catch((err) => {
          console.error(`Failed to load farmers for pool ${selectedPool.pool_id}:`, err);
          setModalFarmersError(true);
        })
        .finally(() => {
          setModalFarmersLoading(false);
        });
    }
  }, [selectedPool]);

  if (!isLoggedIn) {
    return null;
  }

  // Calculate statistics
  const activePoolsCount = pools.filter((p) => p.status.toLowerCase() !== "settled").length;
  const totalQty = pools.reduce((sum, p) => sum + p.your_contribution_kg, 0);
  const totalEarnings = profile?.total_earnings ?? 0;
  const trustScore = profile?.trust_score ?? 0;

  const getTrustColorClass = (score: number) => {
    if (score >= 3.5) return "text-field-green bg-field-green/5 border-field-green/20";
    if (score >= 2.0) return "text-harvest-gold bg-harvest-gold/5 border-harvest-gold/20";
    return "text-alert-red bg-alert-red/5 border-alert-red/20";
  };

  const getTrustIconColor = (score: number) => {
    if (score >= 3.5) return "text-field-green";
    if (score >= 2.0) return "text-harvest-gold";
    return "text-alert-red";
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans p-6">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-charcoal"
            style={{ fontFamily: "Mukta, sans-serif" }}
          >
            My Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Your active pools and recent activity
          </p>
        </div>
        {profile?.name && (
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-semibold text-charcoal">
            Welcome, {profile.name}
          </div>
        )}
      </div>

      {/* CALL TO ACTION BANNER */}
      <div className="bg-field-green/5 border border-field-green/20 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
        <div>
          <h4 className="font-sans font-semibold text-sm text-charcoal">
            Have crops to sell?
          </h4>
          <p className="font-sans text-xs text-gray-400 mt-0.5">
            Call our toll-free IVR line to list your produce and join the next pool
          </p>
        </div>
        <div className="text-right sm:text-right">
          <span
            className="font-display font-bold text-lg text-field-green block sm:inline"
            style={{ fontFamily: "Mukta, sans-serif" }}
          >
            1800-120-MITRA
          </span>
          <span className="text-[10px] text-gray-400 block sm:mt-0.5">Toll-Free (24/7 Support)</span>
        </div>
      </div>

      {/* ERROR STATE */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 my-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
          <h3 className="font-sans font-semibold text-sm text-red-600">
            Could not load your data
          </h3>
          <p className="font-sans text-xs text-gray-400 mt-1">
            Make sure the backend is running
          </p>
          <button
            onClick={fetchData}
            className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading ? (
              // Skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* 1. ACTIVE POOLS */}
                <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-sky-blue p-5 shadow-sm flex items-center gap-4 hover:border-gray-300 hover:border-l-sky-blue transition-colors">
                  <div className="w-10 h-10 rounded-full bg-field-green/10 text-field-green flex items-center justify-center shrink-0">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      Active Pools
                    </div>
                    <div className="font-display font-semibold text-2xl text-charcoal">
                      {activePoolsCount}
                    </div>
                  </div>
                </div>

                {/* 2. TOTAL QUANTITY */}
                <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-field-green p-5 shadow-sm flex items-center gap-4 hover:border-gray-300 hover:border-l-field-green transition-colors">
                  <div className="w-10 h-10 rounded-full bg-soil-brown/10 text-soil-brown flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      Total Quantity
                    </div>
                    <div className="font-display font-semibold text-2xl text-charcoal">
                      {totalQty} kg
                    </div>
                  </div>
                </div>

                {/* 3. TOTAL EARNINGS */}
                <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-field-green p-5 shadow-sm flex items-center gap-4 hover:border-gray-300 hover:border-l-field-green transition-colors">
                  <div className="w-10 h-10 rounded-full bg-sky-blue/10 text-sky-blue flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      Total Earnings
                    </div>
                    <div className="font-display font-semibold text-2xl text-charcoal">
                      ₹{totalEarnings.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 4. TRUST SCORE */}
                <div className={`bg-white rounded-xl border p-5 shadow-sm flex items-center gap-4 hover:border-gray-300 transition-colors ${getTrustColorClass(trustScore)}`}>
                  <div className={`w-10 h-10 rounded-full bg-white/50 border border-current flex items-center justify-center shrink-0 ${getTrustIconColor(trustScore)}`}>
                    {trustScore >= 2.0 ? (
                      <Star className="w-5 h-5 fill-current" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                      Trust Score
                    </div>
                    <div className="font-display font-semibold text-2xl">
                      {trustScore > 0 ? trustScore.toFixed(1) : "N/A"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CONTENT SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Pools Section */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2
                className="text-lg font-semibold text-charcoal"
                style={{ fontFamily: "Mukta, sans-serif" }}
              >
                My Pools
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  // Pools skeleton
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="h-2 bg-gray-100 rounded w-1/4" />
                          <div className="h-4 bg-gray-100 rounded w-1/2" />
                          <div className="h-2 bg-gray-100 rounded w-1/3" />
                        </div>
                        <div className="w-16 h-5 bg-gray-100 rounded-full" />
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between">
                          <div className="h-2 bg-gray-100 rounded w-1/3" />
                          <div className="h-2 bg-gray-100 rounded w-1/12" />
                        </div>
                        <div className="h-2 bg-gray-100 rounded w-full" />
                      </div>
                      <div className="h-10 bg-gray-50 border border-gray-100 rounded-lg" />
                    </div>
                  ))
                ) : pools.length === 0 ? (
                  <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
                    <Sprout className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="font-sans text-sm text-gray-500">
                      You&apos;re not in any crop pools yet
                    </p>
                    <p className="font-sans text-xs text-gray-400 mt-1">
                      Call our toll-free line above to join the next pool
                    </p>
                  </div>
                ) : (
                  pools.map((pool) => {
                    const progressPercent = Math.min(
                      Math.round((pool.current_qty_kg / pool.target_qty_kg) * 100),
                      100
                    );

                    const hasSettledPrice = pool.settled_price_per_kg !== null && pool.settled_price_per_kg > 0;
                    const hasMandiRate = pool.mandi_rate_per_kg !== null && pool.mandi_rate_per_kg > 0;
                    const premiumPercent = (hasSettledPrice && hasMandiRate)
                      ? ((pool.settled_price_per_kg! - pool.mandi_rate_per_kg!) / pool.mandi_rate_per_kg! * 100).toFixed(1)
                      : "0.0";

                    return (
                      <div
                        key={pool.pool_id}
                        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-gray-400 font-mono">
                                Pool #{pool.pool_id}
                              </span>
                              <h3 className="font-display font-semibold text-base text-charcoal">
                                {pool.crop}
                              </h3>
                              <p className="text-xs text-gray-400">{pool.location}</p>
                            </div>
                            <StatusBadge status={pool.status as any} />
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>
                                {pool.current_qty_kg}kg / {pool.target_qty_kg}kg
                              </span>
                              <span>{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-field-green"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Contribution Info */}
                          <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 font-medium">Your Contribution:</span>
                              <span className="font-bold text-charcoal">{pool.your_contribution_kg} kg</span>
                            </div>
                            
                            {hasSettledPrice && (
                              <div className="mt-1.5 pt-1.5 border-t border-gray-200/50 flex flex-col gap-0.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500 font-medium">Settled:</span>
                                  <span className="font-semibold text-field-green font-display" style={{ fontFamily: "Mukta, sans-serif" }}>
                                    ₹{pool.settled_price_per_kg!.toFixed(2)}/kg
                                  </span>
                                </div>
                                {hasMandiRate && (
                                  <div className="text-[10px] text-gray-400 text-right">
                                    Mandi avg: ₹{pool.mandi_rate_per_kg!.toFixed(2)}/kg &middot; {premiumPercent}% more
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedPool(pool)}
                          className="mt-4 text-xs font-semibold text-soil-brown hover:underline inline-flex items-center gap-1 self-start cursor-pointer select-none rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Activity Section */}
            <div>
              <h2
                className="text-lg font-semibold text-charcoal mb-4"
                style={{ fontFamily: "Mukta, sans-serif" }}
              >
                Recent Activity
              </h2>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-h-[150px] flex flex-col">
                {callsError ? (
                  <div className="flex-1 flex items-center justify-center text-center text-xs text-gray-400 italic py-6">
                    Activity unavailable
                  </div>
                ) : loading ? (
                  <div className="flex-1 space-y-4 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-12 h-3 bg-gray-100 rounded" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : calls.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <PhoneCall className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="font-sans text-sm text-gray-500">No recent calls</p>
                    <p className="font-sans text-xs text-gray-400 mt-1">
                      Your call history will show up here
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 flex-grow">
                    {calls.slice(0, 5).map((call) => {
                      const dateObj = new Date(call.timestamp);
                      const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const isToday = dateObj.toDateString() === new Date().toDateString();
                      const dateLabel = isToday ? `Today ${formattedTime}` : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

                      return (
                        <div key={call.call_id} className="flex gap-3 items-start border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
                          <div className="text-[10px] text-gray-400 font-mono w-16 shrink-0 pt-0.5">
                            {dateLabel}
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <span className="text-xs text-charcoal font-medium leading-normal">
                              Pledged {call.quantity_kg}kg of {call.crop} in {call.location}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <LanguageBadge code={call.language} />
                              {call.pool_id ? (
                                <span className="text-[9px] text-soil-brown bg-soil-brown/5 px-1.5 py-0.5 rounded font-mono font-medium">
                                  Pool #{call.pool_id}
                                </span>
                              ) : null}
                              <span className={`text-[9px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5 ${
                                call.status === "pooled"
                                  ? "bg-sky-blue/10 text-sky-blue"
                                  : call.status === "pending"
                                  ? "bg-harvest-gold/10 text-harvest-gold"
                                  : "bg-gray-100 text-gray-400"
                              }`}>
                                {call.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* POOL DETAIL MODAL */}
      {selectedPool && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 max-w-lg w-full p-6 shadow-sm relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPool(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs text-gray-400 font-mono">
                Pool Details &middot; #{selectedPool.pool_id}
              </span>
              <h3 className="font-display font-bold text-xl text-charcoal mt-1">
                {selectedPool.crop} Pool
              </h3>
              <p className="text-xs text-gray-400">{selectedPool.location}</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Status</span>
                <StatusBadge status={selectedPool.status as any} />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Total Quantity Pooled</span>
                <span className="text-xs text-charcoal font-semibold">{selectedPool.current_qty_kg} kg</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Target Quantity</span>
                <span className="text-xs text-charcoal font-semibold">{selectedPool.target_qty_kg} kg</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Farmers Participated</span>
                <span className="text-xs text-charcoal font-semibold">{selectedPool.farmers_count}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Your Contribution</span>
                <span className="text-xs text-soil-brown font-semibold">{selectedPool.your_contribution_kg} kg</span>
              </div>

              {selectedPool.settled_price_per_kg && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">Payout Price</span>
                  <span className="text-xs text-field-green font-semibold">₹{selectedPool.settled_price_per_kg.toFixed(2)}/kg</span>
                </div>
              )}
            </div>

            {/* FARMERS IN THIS POOL SECTION */}
            <div className="border-t border-gray-100 mt-5 pt-4">
              <h4 className="font-display font-semibold text-sm text-charcoal mb-3">
                Farmers in this Pool
              </h4>

              {modalFarmersLoading ? (
                <div className="flex items-center justify-center py-6 text-xs text-gray-400 gap-2 font-sans">
                  <Loader2 className="w-4 h-4 animate-spin text-soil-brown" />
                  <span>Loading farmers...</span>
                </div>
              ) : modalFarmersError ? (
                <div className="py-4 text-center text-xs text-alert-red font-sans">
                  Could not load farmer details
                </div>
              ) : modalFarmers.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400 font-sans italic">
                  No farmer details available.
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-150 rounded-lg max-h-48 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 border-b border-gray-150 text-[10px] font-medium uppercase tracking-widest">
                        <th className="px-3 py-2">Phone</th>
                        <th className="px-3 py-2">Quantity</th>
                        <th className="px-3 py-2">Trust Score</th>
                        <th className="px-3 py-2">Language</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-charcoal">
                      {modalFarmers.map((farmer, idx) => {
                        const scoreColor = farmer.trust_score >= 3.5
                          ? "text-field-green"
                          : farmer.trust_score >= 2.0
                          ? "text-harvest-gold"
                          : "text-alert-red";

                        return (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2 font-mono text-gray-500">{farmer.phone}</td>
                            <td className="px-3 py-2 font-medium">{farmer.quantity_kg} kg</td>
                            <td className={`px-3 py-2 font-semibold ${scoreColor}`}>★ {farmer.trust_score.toFixed(1)}</td>
                            <td className="px-3 py-2">
                              <LanguageBadge code={farmer.language} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPool(null)}
              className="mt-6 w-full bg-charcoal text-white rounded-lg py-2 text-xs font-semibold hover:brightness-90 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 cursor-pointer select-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
