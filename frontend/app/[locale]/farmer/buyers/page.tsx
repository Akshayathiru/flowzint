"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useFarmerSessionStore } from "@/store/farmerSessionStore";
import { buyerApi } from "@/lib/buyerApi";
import { BuyerProfile } from "@/types";
import { Store, MapPin, Package, Phone, Loader2, AlertCircle } from "lucide-react";

export default function FarmerBuyersPage() {
  const router = useRouter();
  const { isLoggedIn, hasHydrated } = useFarmerSessionStore();

  const [buyers, setBuyers] = useState<BuyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.push("/login?role=farmer");
    }
  }, [hasHydrated, isLoggedIn, router]);

  const fetchBuyers = () => {
    setLoading(true);
    setError(null);
    buyerApi.getAll()
      .then(({ data, offline }) => {
        if (offline) {
          throw new Error("Could not connect to real backend API");
        }
        setBuyers(data);
      })
      .catch((err) => {
        console.error("Failed to load buyers:", err);
        setError(err.message || "Could not load data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchBuyers();
    }
  }, [isLoggedIn]);

  // Mask phone numbers for farmer view privacy (e.g. +91 9876543210 -> +91 98XXX 43210)
  const maskPhone = (phone: string) => {
    if (!phone) return "Unknown";
    const clean = phone.trim().replace(/\s+/g, "");
    if (clean.length >= 10) {
      const isInd = clean.startsWith("+91");
      const base = isInd ? clean.slice(3) : clean;
      const prefix = isInd ? "+91 " : "";
      if (base.length >= 8) {
        return `${prefix}${base.slice(0, 2)}XXX ${base.slice(-4)}`;
      }
    }
    return phone;
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans p-6">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-charcoal"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          Buyers in Your Area
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Registered wholesalers, traders, and FPO agents bidding on crops
        </p>
      </div>

      {/* ERROR STATE */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 my-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
          <h3 className="font-sans font-semibold text-sm text-red-600">
            Could not load buyers
          </h3>
          <p className="font-sans text-xs text-gray-400 mt-1">
            Make sure the backend is running
          </p>
          <button
            onClick={fetchBuyers}
            className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        // Loading Skeletons
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="space-y-1.5 pt-2">
                <div className="h-3 bg-gray-50 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : buyers.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-sm text-gray-400">
            No buyers registered yet.
          </p>
        </div>
      ) : (
        // Buyers Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buyers.map((buyer) => (
            <div
              key={buyer.buyer_id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className="font-display font-semibold text-base text-charcoal leading-tight"
                    style={{ fontFamily: "Mukta, sans-serif" }}
                  >
                    {buyer.name}
                  </h3>
                  <span className="bg-warm-cream p-1.5 rounded-lg border border-gray-100 text-soil-brown">
                    <Store className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs text-stone-600 font-sans">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-450 shrink-0" />
                    <span className="font-mono text-gray-500">{maskPhone(buyer.phone)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-gray-450 shrink-0" />
                    <span className="capitalize">Buys: <span className="font-medium text-charcoal">{buyer.crop}</span></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-450 shrink-0" />
                    <span className="capitalize">{buyer.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-dashed border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-sans">
                <span>ID: WH-{buyer.buyer_id}</span>
                <span className="font-semibold text-soil-brown bg-warm-cream/50 px-2 py-0.5 rounded border border-gray-200/50">
                  Min lot: {buyer.min_quantity} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
