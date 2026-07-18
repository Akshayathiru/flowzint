"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle, Package, TrendingUp, AlertCircle, Phone } from "lucide-react";

interface PageProps {
  params: {
    phone: string;
    locale: string;
  };
}

export default function FarmerStatusPage({ params }: PageProps) {
  const phone = decodeURIComponent(params.phone);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = () => {
    setLoading(true);
    setError(null);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/farmer/${encodeURIComponent(phone)}/status`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load status");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not retrieve pool status. Please check your phone number.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (phone) {
      fetchStatus();
    }
  }, [phone]);

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-md text-charcoal space-y-6">
        {/* BRAND HEADER */}
        <div className="text-center pb-4 border-b border-gray-100">
          <span className="font-display font-extrabold text-xl tracking-widest uppercase text-soil-brown block">
            MANDI MITRA
          </span>
          <span className="text-xs text-gray-400 font-semibold mt-1 block">
            Farmer Produce Live Status
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-soil-brown" />
            <span>Fetching status for {phone}...</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-alert-red mx-auto" />
            <p className="text-xs font-semibold text-red-600">{error}</p>
            <button
              onClick={fetchStatus}
              className="px-4 py-2 bg-white border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* FARMER IDENTITY */}
            <div className="flex items-center justify-between bg-warm-cream/50 p-4 rounded-xl border border-gray-150">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Farmer Name</span>
                <span className="font-display font-bold text-lg text-charcoal">{data.farmer_name || "Farmer"}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Phone</span>
                <span className="font-mono text-xs text-sky-blue font-semibold">{data.phone}</span>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Pool Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                data.status === "SETTLED"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : data.status === "AUCTION"
                  ? "bg-sky-blue/10 text-sky-blue border border-sky-blue/30"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}>
                {data.status === "SETTLED" ? "Settled ✅" : data.status === "AUCTION" ? "Auction Live ⏱" : "Filling Pool 🧺"}
              </span>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Crop Pledged</span>
                <span className="font-semibold text-sm text-charcoal mt-0.5 block capitalize">{data.crop}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Your Quantity</span>
                <span className="font-semibold text-sm text-charcoal mt-0.5 block">{data.quantity_kg} kg</span>
              </div>
            </div>

            {/* POOL PROGRESS */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>Total Pool Volume:</span>
                <span>{data.total_pool_qty_kg} / {data.target_qty_kg} kg</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-field-green h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (data.total_pool_qty_kg / data.target_qty_kg) * 100)}%` }}
                />
              </div>
            </div>

            {/* WINNING PRICE IF SETTLED */}
            {data.winning_price && (
              <div className="bg-field-green/10 border border-field-green/30 rounded-xl p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-field-green block tracking-wider">Settled Winning Price</span>
                <span className="font-display font-extrabold text-2xl text-field-green mt-0.5 block">₹{data.winning_price}/kg</span>
              </div>
            )}
          </div>
        ) : null}

        <div className="pt-2 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            Powered by Mandi Mitra &middot; Sarvam AI Voice Platform
          </p>
        </div>
      </div>
    </div>
  );
}
