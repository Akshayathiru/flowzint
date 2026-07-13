"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useFarmerSessionStore } from "@/store/farmerSessionStore";
import { farmerApi } from "@/lib/farmerApi";
import { Star, ShieldAlert, AlertCircle, PhoneCall, Sprout, CheckCircle } from "lucide-react";
import LanguageBadge from "@/components/shared/LanguageBadge";

export default function FarmerProfilePage() {
  const router = useRouter();
  const { phone, isLoggedIn } = useFarmerSessionStore();

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

  const [settlements, setSettlements] = useState<Array<{
    pool_id: number;
    crop: string;
    location: string;
    your_quantity_kg: number;
    price_per_kg: number;
    mandi_rate_per_kg: number;
    total_amount: number;
    premium_percent: number;
    buyers: string;
    settled_at: string;
  }>>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=farmer");
    }
  }, [isLoggedIn, router]);

  const fetchProfileData = () => {
    if (!phone) return;
    setLoading(true);
    setError(null);

    Promise.all([
      farmerApi.getProfile(phone),
      farmerApi.getCalls(phone),
      farmerApi.getSettlements(phone),
    ])
      .then(([profileData, callsData, settlementsData]) => {
        setProfile(profileData);
        setCalls(callsData);
        setSettlements(settlementsData);
      })
      .catch((err) => {
        console.error("Failed to load profile data:", err);
        setError(err.message || "Could not load profile details");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isLoggedIn && phone) {
      fetchProfileData();
    }
  }, [phone, isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

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
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-charcoal"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          My Profile
        </h1>
      </div>

      {/* ERROR STATE */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 my-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
          <h3 className="font-sans font-semibold text-sm text-red-600">
            Could not load profile details
          </h3>
          <p className="font-sans text-xs text-gray-400 mt-1">
            Make sure the backend is running
          </p>
          <button
            onClick={fetchProfileData}
            className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        // Loading skeletons
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse space-y-4">
            <div className="h-6 bg-gray-150 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse h-40" />
        </div>
      ) : (
        <>
          {/* PROFILE CARD */}
          {profile && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                      Farmer Name
                    </label>
                    <span className="text-base font-semibold text-charcoal" style={{ fontFamily: "Mukta, sans-serif" }}>
                      {profile.name || "Farmer"}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                      Phone Number
                    </label>
                    <span className="font-mono text-base font-medium text-charcoal">{profile.phone}</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                      Primary Location
                    </label>
                    <span className="text-sm text-charcoal font-medium capitalize">{profile.location}</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                      Primary Crop
                    </label>
                    <span className="text-sm text-charcoal font-medium capitalize">{profile.primary_crop}</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-medium uppercase tracking-widest block">
                      Member Since
                    </label>
                    <span className="text-xs text-gray-450 font-medium font-mono">
                      {new Date(profile.member_since).toLocaleDateString([], { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col md:items-end justify-between gap-6">
                  {/* Trust Score */}
                  <div className={`border rounded-xl p-4 flex items-center gap-3 w-full md:w-auto md:min-w-[200px] ${getTrustColorClass(profile.trust_score)}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/50 border border-current ${getTrustIconColor(profile.trust_score)}`}>
                      {profile.trust_score >= 2.0 ? (
                        <Star className="w-5 h-5 fill-current" />
                      ) : (
                        <ShieldAlert className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-medium tracking-widest text-gray-500 block">Trust Score</span>
                      <span className="text-2xl font-semibold font-display leading-tight">{profile.trust_score.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Stat boxes */}
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest block">Total Calls</span>
                      <span className="text-lg font-semibold font-display text-charcoal">{profile.total_calls}</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest block">Pools Joined</span>
                      <span className="text-lg font-semibold font-display text-charcoal">{profile.total_pools}</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest block">Total Qty</span>
                      <span className="text-lg font-semibold font-display text-charcoal whitespace-nowrap">{profile.total_quantity_kg} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALL HISTORY */}
          <div className="mb-8">
            <h2
              className="text-lg font-semibold text-charcoal mb-4"
              style={{ fontFamily: "Mukta, sans-serif" }}
            >
              Call History
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                      <th className="px-6 py-3">Date/Time</th>
                      <th className="px-6 py-3">Crop</th>
                      <th className="px-6 py-3">Quantity</th>
                      <th className="px-6 py-3">Location</th>
                      <th className="px-6 py-3">Language</th>
                      <th className="px-6 py-3">Pool</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-stone-600 font-sans">
                    {calls.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">
                          No inbound calls recorded.
                        </td>
                      </tr>
                    ) : (
                      calls.map((call) => (
                        <tr key={call.call_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3 font-mono text-gray-500">
                            {new Date(call.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </td>
                          <td className="px-6 py-3 font-semibold text-charcoal capitalize">{call.crop}</td>
                          <td className="px-6 py-3 font-medium text-charcoal">{call.quantity_kg} kg</td>
                          <td className="px-6 py-3 capitalize">{call.location}</td>
                          <td className="px-6 py-3">
                            <LanguageBadge code={call.language} />
                          </td>
                          <td className="px-6 py-3 font-semibold text-soil-brown font-mono">
                            {call.pool_id ? `Pool #${call.pool_id}` : "—"}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                              call.status === "pooled"
                                ? "bg-sky-blue/10 text-sky-blue"
                                : call.status === "pending"
                                ? "bg-harvest-gold/10 text-harvest-gold"
                                : "bg-gray-100 text-gray-400"
                            }`}>
                              {call.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SETTLEMENT HISTORY */}
          <div>
            <h2
              className="text-lg font-semibold text-charcoal mb-4"
              style={{ fontFamily: "Mukta, sans-serif" }}
            >
              Settlement History
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-medium text-gray-400 uppercase tracking-widest font-sans">
                      <th className="px-6 py-3">Pool ID</th>
                      <th className="px-6 py-3">Crop</th>
                      <th className="px-6 py-3">Location</th>
                      <th className="px-6 py-3">Your Qty</th>
                      <th className="px-6 py-3">Price/kg</th>
                      <th className="px-6 py-3">Mandi Rate</th>
                      <th className="px-6 py-3">Premium</th>
                      <th className="px-6 py-3">Total Amount</th>
                      <th className="px-6 py-3">Buyers</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-stone-600 font-sans">
                    {settlements.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-gray-400 italic">
                          No settlements completed yet.
                        </td>
                      </tr>
                    ) : (
                      settlements.map((set) => (
                        <tr key={set.pool_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3 font-semibold text-charcoal">Pool #{set.pool_id}</td>
                          <td className="px-6 py-3 font-semibold text-charcoal capitalize">{set.crop}</td>
                          <td className="px-6 py-3 capitalize">{set.location}</td>
                          <td className="px-6 py-3">{set.your_quantity_kg} kg</td>
                          <td className="px-6 py-3 text-field-green font-semibold">₹{set.price_per_kg.toFixed(2)}</td>
                          <td className="px-6 py-3 text-gray-400">₹{set.mandi_rate_per_kg.toFixed(2)}</td>
                          <td className="px-6 py-3">
                            {set.premium_percent > 0 ? (
                              <span className="inline-block bg-field-green/10 text-field-green text-[10px] font-bold rounded px-2 py-0.5 whitespace-nowrap">
                                +{set.premium_percent}%
                              </span>
                            ) : (
                              <span className="text-gray-300">&mdash;</span>
                            )}
                          </td>
                          <td className="px-6 py-3 font-bold text-charcoal">₹{set.total_amount.toLocaleString()}</td>
                          <td className="px-6 py-3 text-gray-400 max-w-[150px] truncate" title={set.buyers}>
                            {set.buyers}
                          </td>
                          <td className="px-6 py-3 font-mono text-gray-500">
                            {new Date(set.settled_at).toLocaleDateString([], { month: "short", day: "numeric", year: "2-digit" })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
