"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useFarmerSessionStore } from "@/store/farmerSessionStore";
import { farmerApi } from "@/lib/farmerApi";
import { buyerApi } from "@/lib/buyerApi";
import StatusBadge from "@/components/shared/StatusBadge";
import LanguageBadge from "@/components/shared/LanguageBadge";
import { CheckCircle, Package, TrendingUp, ChevronRight, X, Loader2, AlertCircle, FileText, ClipboardCopy, Download } from "lucide-react";
import { toast } from "sonner";

export default function FarmerSettlementsPage() {
  const router = useRouter();
  const { phone, isLoggedIn, hasHydrated } = useFarmerSessionStore();

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

  // Modal States
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [poolDetails, setPoolDetails] = useState<{
    pool_id: number;
    crop: string;
    location: string;
    status: string;
    current_qty_kg: number;
    target_qty_kg: number;
    farmers_count: number;
    your_contribution_kg: number;
    settled_price_per_kg: number | null;
  } | null>(null);
  const [poolFarmers, setPoolFarmers] = useState<Array<{
    phone: string;
    quantity_kg: number;
    trust_score: number;
    call_time: string;
    language: string;
  }>>([]);
  const [poolFarmersLoading, setPoolFarmersLoading] = useState(false);

  const [receiptPoolId, setReceiptPoolId] = useState<number | null>(null);
  const [receiptData, setReceiptData] = useState<{
    pool_id: number;
    crop: string;
    location: string;
    farmer_phone: string;
    quantity: number;
    average_price_per_kg: number;
    total_amount: number;
    buyers: string;
    status: string;
  } | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  // Auth guard
  useEffect(() => {
    if (hasHydrated && !isLoggedIn) {
      router.push("/login?role=farmer");
    }
  }, [hasHydrated, isLoggedIn, router]);

  const fetchSettlements = () => {
    if (!phone) return;
    setLoading(true);
    setError(null);
    farmerApi.getSettlements(phone)
      .then((data) => {
        setSettlements(data);
      })
      .catch((err) => {
        console.error("Failed to fetch settlements:", err);
        setError(err.message || "Could not load settlements");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isLoggedIn && phone) {
      fetchSettlements();
    }
  }, [phone, isLoggedIn]);

  // Load pool details and farmers when selectedPoolId changes
  useEffect(() => {
    if (selectedPoolId && phone) {
      setPoolFarmersLoading(true);
      setPoolFarmers([]);
      setPoolDetails(null);

      // Find matching settlement to populate local info
      const s = settlements.find((item) => item.pool_id === selectedPoolId);
      if (s) {
        setPoolDetails({
          pool_id: s.pool_id,
          crop: s.crop,
          location: s.location,
          status: "SETTLED",
          current_qty_kg: s.your_quantity_kg, // Will update when we know total
          target_qty_kg: s.your_quantity_kg,
          farmers_count: 1,
          your_contribution_kg: s.your_quantity_kg,
          settled_price_per_kg: s.price_per_kg,
        });
      }

      // Fetch other farmers in the pool
      farmerApi.getPoolFarmers(selectedPoolId)
        .then((farmers) => {
          setPoolFarmers(farmers);
          const totalQty = farmers.reduce((sum, f) => sum + f.quantity_kg, 0);
          setPoolDetails((prev) =>
            prev ? { ...prev, current_qty_kg: totalQty, target_qty_kg: totalQty, farmers_count: farmers.length } : null
          );
        })
        .catch((err) => {
          console.error("Failed to load pool farmers:", err);
          toast.error("Could not load details of other farmers in this pool.");
        })
        .finally(() => {
          setPoolFarmersLoading(false);
        });
    }
  }, [selectedPoolId, phone, settlements]);

  // Load receipt details
  const handleOpenReceipt = (poolId: number) => {
    if (!phone) return;
    setReceiptPoolId(poolId);
    setReceiptLoading(true);
    setReceiptData(null);

    buyerApi.getReceipt(poolId, phone)
      .then(({ data }) => {
        setReceiptData(data);
      })
      .catch((err) => {
        console.error("Failed to load receipt:", err);
        toast.error("Failed to load receipt details.");
      })
      .finally(() => {
        setReceiptLoading(false);
      });
  };

  const handleCopyReceiptText = () => {
    if (!receiptData) return;
    const text = `--- MANDI MITRA SETTLEMENT RECEIPT ---
Receipt Date: ${new Date().toLocaleDateString()}
Pool ID: Pool #${receiptData.pool_id}
Crop: ${receiptData.crop.toUpperCase()}
Location: ${receiptData.location.toUpperCase()}
Farmer Phone: ${receiptData.farmer_phone}
Quantity: ${receiptData.quantity} kg
Price/kg: ₹${receiptData.average_price_per_kg.toFixed(2)}
Total Payout: ₹${receiptData.total_amount.toLocaleString()}
Buyer(s): ${receiptData.buyers}
Status: ${receiptData.status}
-------------------------------------`;

    navigator.clipboard.writeText(text);
    toast.success("Receipt copied to clipboard!");
  };

  if (!isLoggedIn) {
    return null;
  }

  // Stats computed from settlements
  const totalSettledPools = settlements.length;
  const totalEarnings = settlements.reduce((sum, s) => sum + s.total_amount, 0);
  const avgPremium = settlements.length > 0
    ? (settlements.reduce((sum, s) => sum + s.premium_percent, 0) / settlements.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans p-6">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-charcoal"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          My Settlements
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Completed pools and earnings history
        </p>
      </div>

      {/* ERROR STATE */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 my-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
          <h3 className="font-sans font-semibold text-sm text-red-600">
            Could not load settlements
          </h3>
          <p className="font-sans text-xs text-gray-400 mt-1">
            Make sure the backend is running
          </p>
          <button
            onClick={fetchSettlements}
            className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
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
                <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-sky-blue p-5 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-field-green/10 text-field-green flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      Total Settled Pools
                    </div>
                    <div className="font-display font-semibold text-2xl text-charcoal">
                      {totalSettledPools}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-field-green p-5 shadow-sm flex items-center gap-4">
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

                <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-harvest-gold p-5 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-harvest-gold/10 text-harvest-gold flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      Avg Premium over Mandi
                    </div>
                    <div className="font-display font-semibold text-2xl text-field-green">
                      +{avgPremium}%
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SETTLEMENTS TABLE */}
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 animate-pulse space-y-4">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-50 rounded" />
                ))}
              </div>
            </div>
          ) : settlements.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <p className="text-sm text-gray-400">
                No settlements yet — your first settled pool will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-medium uppercase tracking-widest text-gray-400">
                      <th className="px-4 py-3">Pool</th>
                      <th className="px-4 py-3">Crop</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Your Qty</th>
                      <th className="px-4 py-3">Price/kg</th>
                      <th className="px-4 py-3">Mandi Rate</th>
                      <th className="px-4 py-3">Premium</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Buyers</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans text-charcoal">
                    {settlements.map((s) => (
                      <tr
                        key={s.pool_id}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      >
                        {/* Make row clickable to open details */}
                        <td
                          className="px-4 py-3 font-mono text-xs font-bold text-sky-blue group-hover:underline"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                        >
                          Pool #{s.pool_id}
                        </td>
                        <td
                          className="px-4 py-3 font-semibold capitalize"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                        >
                          {s.crop}
                        </td>
                        <td
                          className="px-4 py-3 text-gray-500 capitalize"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                        >
                          {s.location}
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                        >
                          {s.your_quantity_kg} kg
                        </td>
                        <td
                          className="px-4 py-3 text-field-green font-semibold"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                        >
                          ₹{s.price_per_kg.toFixed(2)}
                        </td>
                        <td
                          className="px-4 py-3 text-gray-400"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                        >
                          ₹{s.mandi_rate_per_kg.toFixed(2)}
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                        >
                          {s.premium_percent > 0 ? (
                            <span className="inline-block bg-field-green/10 text-field-green text-[10px] font-bold rounded px-2 py-0.5 whitespace-nowrap">
                              +{s.premium_percent}%
                            </span>
                          ) : (
                            <span className="text-gray-300">&mdash;</span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 font-bold"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                        >
                          ₹{s.total_amount.toLocaleString()}
                        </td>
                        <td
                          className="px-4 py-3 text-gray-400 max-w-[150px] truncate"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                          title={s.buyers}
                        >
                          {s.buyers}
                        </td>
                        <td
                          className="px-4 py-3 text-gray-450 font-mono"
                          onClick={() => setSelectedPoolId(s.pool_id)}
                        >
                          {new Date(s.settled_at).toLocaleDateString([], { month: "short", day: "numeric", year: "2-digit" })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReceipt(s.pool_id);
                            }}
                            className="text-sky-blue hover:text-sky-blue/80 hover:underline font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* POOL DETAIL MODAL */}
      {selectedPoolId && poolDetails && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 max-w-lg w-full p-6 shadow-sm relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPoolId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs text-gray-400 font-mono">
                Pool Details &middot; #{poolDetails.pool_id}
              </span>
              <h3 className="font-display font-bold text-xl text-charcoal mt-1">
                {poolDetails.crop} Pool
              </h3>
              <p className="text-xs text-gray-400">{poolDetails.location}</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Status</span>
                <StatusBadge status={poolDetails.status as any} />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Total Quantity Pooled</span>
                <span className="text-xs text-charcoal font-semibold">{poolDetails.current_qty_kg} kg</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Target Quantity</span>
                <span className="text-xs text-charcoal font-semibold">{poolDetails.target_qty_kg} kg</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Farmers Participated</span>
                <span className="text-xs text-charcoal font-semibold">{poolDetails.farmers_count}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Your Contribution</span>
                <span className="text-xs text-soil-brown font-semibold">{poolDetails.your_contribution_kg} kg</span>
              </div>

              {poolDetails.settled_price_per_kg && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">Payout Price</span>
                  <span className="text-xs text-field-green font-semibold">₹{poolDetails.settled_price_per_kg.toFixed(2)}/kg</span>
                </div>
              )}
            </div>

            {/* FARMERS IN THIS POOL SECTION */}
            <div className="border-t border-gray-100 mt-5 pt-4">
              <h4 className="font-display font-semibold text-sm text-charcoal mb-3">
                Farmers in this Pool
              </h4>

              {poolFarmersLoading ? (
                <div className="flex items-center justify-center py-6 text-xs text-gray-400 gap-2 font-sans">
                  <Loader2 className="w-4 h-4 animate-spin text-soil-brown" />
                  <span>Loading farmers...</span>
                </div>
              ) : poolFarmers.length === 0 ? (
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
                      {poolFarmers.map((farmer, idx) => {
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
              onClick={() => setSelectedPoolId(null)}
              className="mt-6 w-full bg-charcoal text-white rounded-lg py-2 text-xs font-semibold hover:brightness-90 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 cursor-pointer select-none"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptPoolId && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full p-6 shadow-sm relative">
            <button
              onClick={() => setReceiptPoolId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-0.5">
                Settlement Receipt
              </span>
              <h3 className="font-display font-semibold text-lg text-charcoal">
                Pool #{receiptPoolId} Receipt
              </h3>
            </div>

            {receiptLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-xs text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-soil-brown" />
                <span>Loading receipt details...</span>
              </div>
            ) : receiptData ? (
              <div className="space-y-4">
                {/* Monospace Code Block */}
                <pre className="bg-gray-50 rounded-lg p-4 border border-gray-200 font-mono text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {`Mandi Mitra Payout Receipt
----------------------------
Date: ${new Date().toLocaleDateString()}
Pool ID: ${receiptData.pool_id}
Crop: ${receiptData.crop.toUpperCase()}
Location: ${receiptData.location}
Phone: ${receiptData.farmer_phone}
----------------------------
Allocated Qty: ${receiptData.quantity} kg
Price/kg: ₹${receiptData.average_price_per_kg.toFixed(2)}
Total Amount: ₹${receiptData.total_amount.toLocaleString()}
Buyer(s): ${receiptData.buyers}
Status: ${receiptData.status}
----------------------------
Thank you for using Mandi Mitra!`}
                </pre>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyReceiptText}
                    className="flex-1 bg-charcoal text-white rounded-lg py-2.5 text-xs font-semibold hover:brightness-90 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </button>
                  <button
                    onClick={() => {
                      const text = `--- MANDI MITRA RECEIPT ---\nPool: #${receiptData.pool_id}\nCrop: ${receiptData.crop}\nQty: ${receiptData.quantity}kg\nPayout: ₹${receiptData.total_amount}\nBuyers: ${receiptData.buyers}`;
                      const element = document.createElement("a");
                      const file = new Blob([text], { type: "text/plain" });
                      element.href = URL.createObjectURL(file);
                      element.download = `receipt_${receiptData.pool_id}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      toast.success("Receipt downloaded!");
                    }}
                    className="border border-gray-200 text-gray-600 rounded-lg p-2.5 hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 bg-white shadow-sm flex items-center justify-center cursor-pointer"
                    title="Download Text File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-alert-red">
                Failed to load receipt information.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
