"use client";

import React, { useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { useFarmerSessionStore } from "@/store/farmerSessionStore";
import { Star, ShieldAlert } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";

const MOCK_CALL_HISTORY = [
  { date: "Today 09:47", crop: "Tomatoes", qty: 80, pool: "Pool #1", status: "Active" },
  { date: "Yesterday 14:20", crop: "Tomatoes", qty: 75, pool: "Pool #1", status: "Duplicate (Merged)" },
  { date: "3 days ago", crop: "Potatoes", qty: 120, pool: "Pool #3", status: "Settled" },
  { date: "5 days ago", crop: "Tomatoes", qty: 60, pool: "Pool #1", status: "Expired" },
];

const MOCK_SETTLEMENT_HISTORY = [
  { poolId: 3, crop: "Potatoes", qty: 120, price: 12.0, total: 1440, date: "3 days ago" },
  { poolId: 10, crop: "Tomatoes", qty: 100, price: 15.5, total: 1550, date: "2 weeks ago" },
];

export default function FarmerProfilePage() {
  const router = useRouter();
  const { phone, isLoggedIn } = useFarmerSessionStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=farmer");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const trustScore = 4.2;

  const getTrustColorClass = (score: number) => {
    if (score >= 3.5) return "text-field-green bg-field-green/5 border-field-green/20";
    if (score >= 2.0) return "text-harvest-gold bg-harvest-gold/5 border-harvest-gold/20";
    return "text-alert-red bg-alert-red/5 border-alert-red/20";
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans p-6">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-charcoal"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          My Profile
        </h1>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Phone Number
              </label>
              <span className="font-mono text-lg font-semibold text-charcoal">{phone}</span>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Primary Location
              </label>
              <span className="text-sm text-charcoal font-medium">Kanchipuram, Tamil Nadu</span>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Primary Crop
              </label>
              <span className="text-sm text-charcoal font-medium">Tomatoes, Potatoes</span>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Member Since
              </label>
              <span className="text-xs text-gray-450 font-medium">July 2025</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col md:items-end justify-between">
            <div className={`border rounded-xl p-4 flex items-center gap-3 w-full md:w-auto md:min-w-[200px] ${getTrustColorClass(trustScore)}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/50 border border-current">
                {trustScore >= 2.0 ? <Star className="w-5 h-5 fill-current" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Trust Score</span>
                <span className="text-2xl font-bold font-display leading-tight">{trustScore.toFixed(1)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full mt-6 md:mt-0">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Calls</span>
                <span className="text-xl font-bold font-display text-charcoal">12</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pools Joined</span>
                <span className="text-xl font-bold font-display text-charcoal">5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CALL HISTORY */}
      <div className="mb-8">
        <h2
          className="text-lg font-bold text-charcoal mb-4"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          Call History
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Crop</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Quantity</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Pool</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {MOCK_CALL_HISTORY.map((call, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-gray-655 font-mono">{call.date}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-charcoal">{call.crop}</td>
                  <td className="px-6 py-4 text-xs font-medium text-charcoal">{call.qty} kg</td>
                  <td className="px-6 py-4 text-xs font-semibold text-soil-brown">{call.pool}</td>
                  <td className="px-6 py-4 text-xs font-medium">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      call.status === "Settled" || call.status === "Active"
                        ? "bg-field-green/10 text-field-green"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {call.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTLEMENT HISTORY */}
      <div>
        <h2
          className="text-lg font-bold text-charcoal mb-4"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          Settlement History
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Pool ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Crop</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Quantity</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Price/kg</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Total Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {MOCK_SETTLEMENT_HISTORY.map((set, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-semibold text-charcoal">Pool #{set.poolId}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-charcoal">{set.crop}</td>
                  <td className="px-6 py-4 text-xs font-medium text-charcoal">{set.qty} kg</td>
                  <td className="px-6 py-4 text-xs font-semibold text-field-green">₹{set.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs font-bold text-charcoal">₹{set.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500 font-mono">{set.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
