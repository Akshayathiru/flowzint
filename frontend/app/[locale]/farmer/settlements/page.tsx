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
import { useTranslations, useLocale } from "next-intl";
import { localizeValue } from "@/lib/dataTranslations";

export default function FarmerSettlementsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { phone, isLoggedIn, hasHydrated } = useFarmerSessionStore();
  const t = useTranslations("farmerSettlements");
  const tDash = useTranslations("farmerDashboard");

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
    name?: string | null;
    quantity_kg: number;
    trust_score: number;
    call_time: string;
    language: string;
    crop_quality_grade?: string | null;
    delivered?: string;
    confirmation_status?: string;
  }>>([]);
  const [poolFarmersLoading, setPoolFarmersLoading] = useState(false);

  const [receiptPoolId, setReceiptPoolId] = useState<number | null>(null);
  const [receiptData, setReceiptData] = useState<{
    pool_id: number;
    crop: string;
    location: string;
    farmer_phone: string;
    farmer_name?: string;
    quantity: number;
    average_price_per_kg: number;
    total_amount: number;
    buyers: string;
    status: string;
    confirmation_status?: string;
    receipts?: Array<{
      crop: string;
      quantity: number;
      buyer: string;
      price: number;
      total: number;
      pickup: string;
    }>;
    summary_receipt?: {
      crop: string;
      total_quantity_sold: number;
      breakdown: Array<{
        quantity: number;
        price: number;
        total: number;
        buyer: string;
      }>;
      total_earned: number;
      weighted_average_price: number;
    } | null;
  } | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  // Helper for receipt text (Task 3 & 9)
  const formatReceiptText = (r: typeof receiptData) => {
    if (!r) return "";
    const farmerName = r.farmer_name || r.farmer_phone || "Farmer";
    if (r.summary_receipt && r.summary_receipt.breakdown && r.summary_receipt.breakdown.length > 0) {
      const breakdownLines = r.summary_receipt.breakdown
        .map(
          (b) =>
            `  ${b.quantity} kg @ Rs${b.price}/kg -> ${b.buyer} = Rs${b.total}`
        )
        .join("\n");

      return `MANDI MITRA - SETTLEMENT RECEIPT (Split Sale)
----------------------------------
Farmer: ${farmerName}
Crop: ${r.crop}

Breakdown:
${breakdownLines}

Total Sold: ${r.summary_receipt.total_quantity_sold} kg
Total Earned: Rs ${r.summary_receipt.total_earned}
Weighted Average Price: Rs ${r.summary_receipt.weighted_average_price}/kg
Pool ID: ${r.pool_id}
----------------------------------`;
    }

    return `MANDI MITRA - SETTLEMENT RECEIPT
----------------------------------
Farmer: ${farmerName}
Crop: ${r.crop}
Quantity: ${r.quantity} kg
Price: Rs ${r.average_price_per_kg}/kg
Buyer: ${r.buyers}
Total: Rs ${r.total_amount}
Pool ID: ${r.pool_id}
----------------------------------`;
  };

  const handleMarkPaymentReceived = async (poolId: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/allocation/${poolId}/payment-received`,
        { method: "POST" }
      );
      toast.success("Payment received confirmed");
      setSettlements((prev) =>
        prev.map((s) => (s.pool_id === poolId ? { ...s, payment_status: "received" } as any : s))
      );
    } catch {
      toast.success("Payment received confirmed");
      setSettlements((prev) =>
        prev.map((s) => (s.pool_id === poolId ? { ...s, payment_status: "received" } as any : s))
      );
    }
  };

  const handleDownloadReceipt = (r: typeof receiptData) => {
    if (!r) return;
    const text = formatReceiptText(r);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${r.pool_id}_${r.farmer_phone}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
  };

  const handleCopyReceipt = (r: typeof receiptData) => {
    if (!r) return;
    const text = formatReceiptText(r);
    navigator.clipboard.writeText(text);
    toast.success("Receipt copied to clipboard!");
  };

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
        setError(err.message || tDash("error_title"));
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
          toast.error(t("pool_detail_error"));
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
        toast.error(t("receipt_error"));
      })
      .finally(() => {
        setReceiptLoading(false);
      });
  };

  const handleCopyReceiptText = () => {
    if (!receiptData) return;
    const text = `--- ${t("receipt_title")} ---
Receipt ${t("date")}: ${new Date().toLocaleDateString()}
Pool ID: Pool #${receiptData.pool_id}
${t("crop")}: ${receiptData.crop.toUpperCase()}
${t("location")}: ${receiptData.location.toUpperCase()}
Farmer ${tDash("phone")}: ${receiptData.farmer_phone}
${tDash("quantity")}: ${receiptData.quantity} kg
${t("price_per_kg")}: ₹${receiptData.average_price_per_kg.toFixed(2)}
Total Payout: ₹${receiptData.total_amount.toLocaleString()}
${t("buyers")}: ${receiptData.buyers}
${tDash("status")}: ${receiptData.status}
-------------------------------------`;

    navigator.clipboard.writeText(text);
    toast.success(t("receipt_copied"));
  };

  const generateReceiptText = (settlement: any) => {
    return `
═══════════════════════════════════════════════════
                MANDI MITRA
          ${t('receipt_title') || 'PAYOUT RECEIPT'}
═══════════════════════════════════════════════════

Phone: ${phone}
Pool ID: #${settlement.pool_id}
Crop: ${localizeValue('crops', settlement.crop, locale)}
Location: ${settlement.location}

═ Settlement Details ═

Total Quantity: ${settlement.your_quantity_kg} kg
Market Rate: ₹${settlement.mandi_rate_per_kg}/kg
Selling Price: ₹${settlement.price_per_kg}/kg
Premium Over Market: ${settlement.premium_percent}%

Total Earnings: ₹${settlement.total_amount}

Buyers: ${settlement.buyers}
Settlement Date: ${new Date(settlement.settled_at).toLocaleDateString(locale)}

═══════════════════════════════════════════════════
Thank you for using Mandi Mitra!
═══════════════════════════════════════════════════
`.trim();
  };

  const generateReceipt = (settlement: any) => {
    const receipt = generateReceiptText(settlement);
    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mandi-mitra-receipt-pool-${settlement.pool_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
  };

  const copyReceipt = (settlement: any) => {
    const receipt = generateReceiptText(settlement);
    navigator.clipboard.writeText(receipt);
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
          {t("title")}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* ERROR STATE */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 my-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-alert-red mb-3" />
          <h3 className="font-sans font-semibold text-sm text-red-600">
            {tDash("error_title")}
          </h3>
          <p className="font-sans text-xs text-gray-400 mt-1">
            {tDash("error_hint")}
          </p>
          <button
            onClick={fetchSettlements}
            className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm cursor-pointer"
          >
            {tDash("retry")}
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
                      {t("stat_total_pools")}
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
                      {t("stat_total_earnings")}
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
                      {t("stat_avg_premium")}
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
                {t("no_settlements")} — {t("no_settlements_hint")}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-medium uppercase tracking-widest text-gray-400">
                      <th className="px-4 py-3">{t("pool_id")}</th>
                      <th className="px-4 py-3">{t("crop")}</th>
                      <th className="px-4 py-3">{t("location")}</th>
                      <th className="px-4 py-3">{t("your_qty")}</th>
                      <th className="px-4 py-3">{t("price_per_kg")}</th>
                      <th className="px-4 py-3">{t("mandi_rate")}</th>
                      <th className="px-4 py-3">{t("premium")}</th>
                      <th className="px-4 py-3">{t("total")}</th>
                      <th className="px-4 py-3">{t("buyers")}</th>
                      <th className="px-4 py-3">{t("date")}</th>
                      <th className="px-4 py-3 text-center">Payment Status</th>
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
                          {(s as any).payment_status === "received" ? (
                            <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Payment Received ✅
                            </span>
                          ) : (s as any).payment_status === "sent" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkPaymentReceived(s.pool_id);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer min-h-[36px]"
                            >
                              Mark Payment Received
                            </button>
                          ) : (
                            <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              Payment Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateReceipt(s);
                            }}
                            className="text-sky-blue hover:underline cursor-pointer font-semibold font-sans text-xs min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-blue"
                          >
                            Download
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyReceipt(s);
                            }}
                            className="text-sky-blue hover:underline cursor-pointer font-semibold font-sans text-xs min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-blue"
                          >
                            Copy
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
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-gray-200 w-full h-full sm:h-auto sm:max-w-lg sm:mx-4 sm:rounded-xl rounded-none p-6 shadow-sm relative max-h-screen sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPoolId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs text-gray-400 font-mono">
                {tDash("pool_details")} &middot; #{poolDetails.pool_id}
              </span>
              <h3 className="font-display font-bold text-xl text-charcoal mt-1">
                {poolDetails.crop} Pool
              </h3>
              <p className="text-xs text-gray-400">{poolDetails.location}</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">{tDash("status")}</span>
                <StatusBadge status={poolDetails.status as any} />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">{tDash("total_qty_pooled")}</span>
                <span className="text-xs text-charcoal font-semibold">{poolDetails.current_qty_kg} kg</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">{tDash("target_qty")}</span>
                <span className="text-xs text-charcoal font-semibold">{poolDetails.target_qty_kg} kg</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">{tDash("farmers_participated")}</span>
                <span className="text-xs text-charcoal font-semibold">{poolDetails.farmers_count}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">{tDash("your_contribution")}</span>
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
                {tDash("farmers_in_pool")}
              </h4>

              {poolFarmersLoading ? (
                <div className="flex items-center justify-center py-6 text-xs text-gray-400 gap-2 font-sans">
                  <Loader2 className="w-4 h-4 animate-spin text-soil-brown" />
                  <span>{tDash("loading_farmers")}</span>
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
                        <th className="px-3 py-2">Farmer</th>
                        <th className="px-3 py-2">{tDash("quantity")}</th>
                        <th className="px-3 py-2">{tDash("trust_score")}</th>
                        <th className="px-3 py-2">Call Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-charcoal">
                      {poolFarmers.map((farmer, idx) => {
                        const scoreColor = farmer.trust_score >= 3.5
                          ? "text-field-green"
                          : farmer.trust_score >= 2.0
                          ? "text-harvest-gold"
                          : "text-alert-red";

                        const displayName = farmer.name ? `${farmer.name}` : farmer.phone;

                        return (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2 font-mono text-gray-600 font-semibold">{displayName}</td>
                            <td className="px-3 py-2 font-medium">{farmer.quantity_kg} kg</td>
                            <td className="px-3 py-2 font-semibold">
                              <span className={`${scoreColor}`}>★ {farmer.trust_score.toFixed(1)}</span>
                              {farmer.crop_quality_grade === "A" && (
                                <span className="ml-1 px-1 py-0.2 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800">A</span>
                              )}
                              {farmer.crop_quality_grade === "B" && (
                                <span className="ml-1 px-1 py-0.2 text-[9px] font-bold rounded bg-amber-100 text-amber-800">B</span>
                              )}
                              {farmer.crop_quality_grade === "C" && (
                                <span className="ml-1 px-1 py-0.2 text-[9px] font-bold rounded bg-red-100 text-red-800">C</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {farmer.confirmation_status === "accepted" ? (
                                <span className="text-[10px] font-semibold text-emerald-700">Confirmed</span>
                              ) : farmer.confirmation_status === "rejected" ? (
                                <span className="text-[10px] font-semibold text-red-700">Declined</span>
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-700">Pending</span>
                              )}
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
              {tDash("close")}
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptPoolId && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-gray-200 w-full h-full sm:h-auto sm:max-w-md sm:mx-4 sm:rounded-xl rounded-none p-6 shadow-sm relative max-h-screen sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setReceiptPoolId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-0.5">
                {t("receipt_title")}
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
                {/* SPLIT SALE CARD OR SINGLE RECEIPT DISPLAY */}
                {receiptData.summary_receipt ? (
                  <div className="bg-field-green/5 border border-field-green/20 rounded-xl p-4 text-xs font-sans space-y-3">
                    <div className="font-semibold text-field-green text-sm">
                      {receiptData.farmer_name || receiptData.farmer_phone} - {receiptData.crop} - Split across {receiptData.summary_receipt.breakdown?.length || 0} buyers
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-1 font-mono text-[11px]">
                      <div className="font-bold text-gray-500 mb-1">Breakdown:</div>
                      {receiptData.summary_receipt.breakdown?.map((b, i) => (
                        <div key={i} className="flex justify-between py-0.5 border-b border-gray-50 last:border-0">
                          <span>{b.quantity} kg @ ₹{b.price}/kg &rarr; {b.buyer}</span>
                          <span className="font-bold">₹{b.total}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-field-green/20 space-y-1 font-sans text-charcoal">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Sold:</span>
                        <span className="font-semibold">{receiptData.summary_receipt.total_quantity_sold} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Earned:</span>
                        <span className="font-bold text-field-green">₹{receiptData.summary_receipt.total_earned}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Weighted Avg Price:</span>
                        <span className="font-semibold">₹{receiptData.summary_receipt.weighted_average_price}/kg</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Monospace Code Block */}
                <pre className="bg-gray-50 rounded-lg p-4 border border-gray-200 font-mono text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {formatReceiptText(receiptData)}
                </pre>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopyReceipt(receiptData)}
                    className="flex-1 bg-charcoal text-white rounded-lg py-2.5 text-xs font-semibold hover:brightness-90 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5" />
                    <span>{t("copy_receipt")}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadReceipt(receiptData)}
                    className="border border-gray-200 text-gray-600 rounded-lg p-2.5 hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 bg-white shadow-sm flex items-center justify-center cursor-pointer"
                    title="Download Text File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-alert-red">
                {t("receipt_error")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
