"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "@/lib/navigation";
import { Search, AlertTriangle, Package } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import FarmerCallLogTable, {
  FarmerCallRecord,
} from "@/components/farmers/FarmerCallLogTable";
import { CROPS } from "@/lib/constants";
import { useTranslations } from "next-intl";
import TableSkeleton from "@/components/shared/TableSkeleton";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";

interface BackendFarmerPool {
  poolId: string;
  crop: string;
  quantity: number;
  status: string;
}

interface BackendFarmer {
  phone: string;
  name: string;
  trustScore: number;
  successCount: number;
  noShowCount: number;
  pools: BackendFarmerPool[];
}

export default function BuyerFarmerRegistryPage() {
  const router = useRouter();
  const t = useTranslations("farmer");
  const { isLoggedIn } = useBuyerSessionStore();
  const [farmers, setFarmers] = useState<FarmerCallRecord[]>([]);
  const [search, setSearch] = useState("");
  const [trustFilter, setTrustFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [isLoggedIn, router]);

  const fetchFarmers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/farmers`
      );
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data: BackendFarmer[] = await res.json();
      setFarmers(
        data.map((f) => {
          const lastPool = f.pools[f.pools.length - 1];
          return {
            phone: f.phone,
            // /farmers does not return crop/location as top-level fields —
            // derived from the farmer's most recent pool membership.
            crop: lastPool
              ? lastPool.crop.charAt(0).toUpperCase() + lastPool.crop.slice(1)
              : "Unknown",
            // Backend has no call-timestamp data on this endpoint.
            lastCall: "Unknown",
            lastQty: lastPool ? lastPool.quantity : 0,
            trust: Math.round((f.trustScore / 20) * 10) / 10,
            totalCalls: f.pools.length,
            // Backend does not return a location/district field here.
            district: "Unknown",
          };
        })
      );
    } catch (err) {
      console.error("Failed to load farmers:", err);
      setError("Could not load farmers from backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchFarmers();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  const filteredFarmers = farmers.filter((farmer) => {
    const matchesSearch =
      farmer.phone.toLowerCase().includes(search.toLowerCase()) ||
      farmer.crop.toLowerCase().includes(search.toLowerCase());

    const matchesCrop =
      cropFilter === "all" || farmer.crop === cropFilter;

    let matchesTrust = true;
    if (farmer.isFirstCall) {
      matchesTrust = trustFilter === "all" || trustFilter === "high";
    } else {
      if (trustFilter === "high") matchesTrust = farmer.trust >= 3.5;
      else if (trustFilter === "medium")
        matchesTrust = farmer.trust >= 2 && farmer.trust < 3.5;
      else if (trustFilter === "low") matchesTrust = farmer.trust < 2;
    }

    return matchesSearch && matchesCrop && matchesTrust;
  });

  const sortedFarmers = [...filteredFarmers].sort((a, b) => {
    if (sortBy === "trust_desc") return b.trust - a.trust;
    if (sortBy === "trust_asc") return a.trust - b.trust;
    if (sortBy === "calls_desc") return b.totalCalls - a.totalCalls;
    if (sortBy === "qty_desc") return b.lastQty - a.lastQty;
    return 0;
  });

  const handleRowClick = (phone: string) => {
    router.push(`/buyer/farmers/${encodeURIComponent(phone)}`);
  };

  const handleReviewFlagged = () => {
    setTrustFilter("low");
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const flaggedCount = farmers.filter((f) => f.trust < 2 && !f.isFirstCall).length;

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans pb-12">
      <PageHeader
        title="Farmer Registry"
        subtitle="All farmers in the pooling network"
        actions={
          <div className="flex flex-wrap gap-2.5 select-none">
            <span className="border border-gray-200 rounded-full px-3 py-1 font-sans text-xs font-semibold text-gray-500 bg-white">
              {farmers.length} total farmers
            </span>
            <span className="bg-alert-red/10 border border-alert-red/20 rounded-full px-3 py-1 font-sans text-xs font-semibold text-alert-red">
              {flaggedCount} flagged
            </span>
          </div>
        }
      />

      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg font-sans text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all bg-white text-charcoal"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 items-center select-none">
            <span className="font-sans text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-1 hidden sm:inline">
              Trust:
            </span>
            {(["all", "high", "medium", "low"] as const).map((tVal) => {
              const label =
                tVal === "all"
                  ? "All"
                  : tVal === "high"
                  ? `${t("trust_high")} (≥3.5)`
                  : tVal === "medium"
                  ? `${t("trust_medium")} (2–3.5)`
                  : `${t("trust_low")} (<2)`;

              const isSelected = trustFilter === tVal;
              return (
                <button
                  key={tVal}
                  onClick={() => setTrustFilter(tVal)}
                  className={`rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
                    isSelected
                      ? "bg-charcoal text-white"
                      : "border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-gray-655 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
          >
            <option value="all">All Crops</option>
            {CROPS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-gray-655 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
          >
            <option value="recent">Most Recent</option>
            <option value="trust_desc">Trust Score &darr;</option>
            <option value="trust_asc">Trust Score &uarr;</option>
            <option value="calls_desc">Total Calls &darr;</option>
            <option value="qty_desc">Quantity &darr;</option>
          </select>
        </div>

        {flaggedCount > 0 && (
          <div className="bg-alert-red/5 border border-alert-red/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-alert-red shrink-0" />
            <span className="font-sans text-xs text-alert-red font-medium">
              {t("flagged_banner", { count: flaggedCount })}
            </span>
            <button
              onClick={handleReviewFlagged}
              className="text-alert-red font-semibold underline text-xs ml-auto cursor-pointer"
            >
              Review
            </button>
          </div>
        )}

        <div ref={tableRef}>
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
              <AlertTriangle className="w-8 h-8 text-alert-red mb-3" />
              <h3 className="font-sans font-semibold text-sm text-red-600">
                Could not load farmers
              </h3>
              <p className="font-sans text-xs text-gray-400 mt-1">
                Make sure the backend is running
              </p>
              <button
                onClick={fetchFarmers}
                className="border border-gray-200 rounded-lg px-4 py-2 mt-4 bg-white text-xs font-semibold text-charcoal hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <TableSkeleton rows={8} cols={7} />
          ) : sortedFarmers.length > 0 ? (
            <FarmerCallLogTable
              records={sortedFarmers}
              onRowClick={handleRowClick}
              sortBy={sortBy}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center text-center shadow-sm">
              <Package className="w-8 h-8 text-gray-350" />
              <h3 className="font-display font-semibold text-sm text-gray-500 mt-3">
                {farmers.length === 0 ? "No farmers registered yet" : "No farmers match your filters"}
              </h3>
              <p className="font-sans text-xs text-gray-500 mt-1">
                {farmers.length === 0 ? "Farmers will appear here once they join a pool" : "Try adjusting the trust or crop filter"}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <span className="font-sans text-xs text-gray-500">
            Showing {sortedFarmers.length} of {farmers.length} farmers
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="border border-gray-200 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-500 bg-gray-50/50 cursor-not-allowed opacity-40"
            >
              Previous
            </button>
            <button className="border border-gray-200 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-600 hover:bg-gray-50 bg-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
