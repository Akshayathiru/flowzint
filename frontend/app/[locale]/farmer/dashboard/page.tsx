"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useFarmerSessionStore } from "@/store/farmerSessionStore";
import StatusBadge from "@/components/shared/StatusBadge";
import { Sprout, PhoneCall, CheckCircle, ArrowRight, X } from "lucide-react";

// Mock data for farmers in the registry
const MOCK_POOLS = [
  {
    pool_id: 1,
    crop: "Tomatoes",
    location: "Kanchipuram",
    current_qty_kg: 820,
    target_qty_kg: 1000,
    farmers_count: 6,
    status: "auctioning",
    contributed_qty: 80,
  },
  {
    pool_id: 2,
    crop: "Onions",
    location: "Vellore",
    current_qty_kg: 312,
    target_qty_kg: 500,
    farmers_count: 4,
    status: "filling",
    contributed_qty: 140,
  },
  {
    pool_id: 3,
    crop: "Potatoes",
    location: "Chengalpattu",
    current_qty_kg: 500,
    target_qty_kg: 500,
    farmers_count: 8,
    status: "settled",
    contributed_qty: 120,
    price_received: 12.0,
  },
];

const MOCK_ACTIVITIES = [
  { time: "Today 09:47", type: "call", message: "Inbound IVR call logged successfully" },
  { time: "Today 09:47", type: "join", message: "Joined Tomato Pool #1 with 80kg" },
  { time: "Yesterday", type: "call", message: "Outbound IVR survey response recorded" },
  { time: "3 days ago", type: "settlement", message: "Received settlement of ₹1,440 for Potato Pool #3" },
  { time: "4 days ago", type: "join", message: "Joined Potato Pool #3 with 120kg" },
];

export default function FarmerDashboard() {
  const router = useRouter();
  const { phone, isLoggedIn } = useFarmerSessionStore();
  const [selectedPool, setSelectedPool] = useState<typeof MOCK_POOLS[0] | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=farmer");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  // Calculate stats
  const activePoolsCount = MOCK_POOLS.filter((p) => p.status !== "settled").length;
  const totalQty = MOCK_POOLS.reduce((acc, p) => acc + p.contributed_qty, 0);
  const avgPrice = 12.0; // ₹/kg average for settled pools

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans p-6">
      {/* PAGE HEADER */}
      <div className="mb-8">
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

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-field-green/10 text-field-green flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Active Pools
            </div>
            <div className="font-display font-bold text-2xl text-charcoal">
              {activePoolsCount}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-soil-brown/10 text-soil-brown flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Total Quantity Contributed
            </div>
            <div className="font-display font-bold text-2xl text-charcoal">
              {totalQty} kg
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-harvest-gold/10 text-harvest-gold flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Avg Price Received
            </div>
            <div className="font-display font-bold text-2xl text-charcoal">
              ₹{avgPrice.toFixed(2)}/kg
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Pools Section */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2
            className="text-lg font-bold text-charcoal"
            style={{ fontFamily: "Mukta, sans-serif" }}
          >
            My Pools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_POOLS.map((pool) => {
              const progressPercent = Math.min(
                Math.round((pool.current_qty_kg / pool.target_qty_kg) * 100),
                100
              );

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

                    <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-medium">Your Contribution:</span>
                        <span className="font-bold text-charcoal">{pool.contributed_qty} kg</span>
                      </div>
                      {pool.price_received && (
                        <div className="flex justify-between text-xs mt-1.5 pt-1.5 border-t border-gray-200/50">
                          <span className="text-gray-500 font-medium">Settled Price:</span>
                          <span className="font-bold text-field-green">₹{pool.price_received.toFixed(2)}/kg</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPool(pool)}
                    className="mt-4 text-xs font-semibold text-soil-brown hover:underline inline-flex items-center gap-1 self-start"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2
            className="text-lg font-bold text-charcoal mb-4"
            style={{ fontFamily: "Mukta, sans-serif" }}
          >
            Recent Activity
          </h2>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col gap-4">
              {MOCK_ACTIVITIES.map((act, index) => (
                <div key={index} className="flex gap-3">
                  <div className="text-[10px] text-gray-400 font-mono w-16 shrink-0 pt-0.5">
                    {act.time}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-charcoal font-medium">
                      {act.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* POOL DETAIL MODAL */}
      {selectedPool && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full p-6 shadow-lg relative">
            <button
              onClick={() => setSelectedPool(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors"
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

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Status</span>
                <StatusBadge status={selectedPool.status as any} />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Total Quantity pooled</span>
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
                <span className="text-xs text-soil-brown font-semibold">{selectedPool.contributed_qty} kg</span>
              </div>

              {selectedPool.price_received && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">Payout Price</span>
                  <span className="text-xs text-field-green font-semibold">₹{selectedPool.price_received.toFixed(2)}/kg</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPool(null)}
              className="mt-6 w-full bg-charcoal text-white rounded-lg py-2.5 text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
