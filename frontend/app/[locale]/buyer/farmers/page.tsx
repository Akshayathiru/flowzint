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

export const initialFarmers: FarmerCallRecord[] = [
  {
    phone: "+91 98XXX 10001",
    crop: "Tomatoes",
    lastCall: "Today 09:47",
    lastQty: 80,
    trust: 4.2,
    totalCalls: 12,
    district: "Kanchipuram",
  },
  {
    phone: "+91 97XXX 10002",
    crop: "Tomatoes",
    lastCall: "Today 09:44",
    lastQty: 350,
    trust: 3.8,
    totalCalls: 9,
    district: "Kanchipuram",
  },
  {
    phone: "+91 96XXX 10003",
    crop: "Onions",
    lastCall: "Yesterday",
    lastQty: 120,
    trust: 4.5,
    totalCalls: 21,
    district: "Vellore",
  },
  {
    phone: "+91 95XXX 10004",
    crop: "Tomatoes",
    lastCall: "Today 08:30",
    lastQty: 220,
    trust: 2.9,
    totalCalls: 6,
    district: "Kanchipuram",
  },
  {
    phone: "+91 94XXX 10005",
    crop: "Chillies",
    lastCall: "2 days ago",
    lastQty: 60,
    trust: 1.8,
    totalCalls: 3,
    district: "Salem",
    isFirstCall: true,
  },
  {
    phone: "+91 93XXX 10006",
    crop: "Onions",
    lastCall: "Today 10:01",
    lastQty: 140,
    trust: 3.1,
    totalCalls: 7,
    district: "Vellore",
  },
  {
    phone: "+91 92XXX 10007",
    crop: "Potatoes",
    lastCall: "3 days ago",
    lastQty: 300,
    trust: 4.8,
    totalCalls: 31,
    district: "Chengalpattu",
  },
  {
    phone: "+91 91XXX 10008",
    crop: "Brinjal",
    lastCall: "Yesterday",
    lastQty: 90,
    trust: 2.3,
    totalCalls: 4,
    district: "Tiruvannamalai",
    isFirstCall: true,
  },
];

export default function BuyerFarmerRegistryPage() {
  const router = useRouter();
  const t = useTranslations("farmer");
  const { isLoggedIn } = useBuyerSessionStore();
  const [search, setSearch] = useState("");
  const [trustFilter, setTrustFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);

  const tableRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?role=buyer");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  const filteredFarmers = initialFarmers.filter((farmer) => {
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

  const flaggedCount = initialFarmers.filter((f) => f.trust < 2 && !f.isFirstCall).length;

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans pb-12">
      <PageHeader
        title="Farmer Registry"
        subtitle="All farmers in the pooling network"
        actions={
          <div className="flex flex-wrap gap-2.5 select-none">
            <span className="border border-gray-200 rounded-full px-3 py-1 font-sans text-xs font-semibold text-gray-500 bg-white">
              247 total callers
            </span>
            <span className="bg-sky-blue/10 border border-sky-blue/20 rounded-full px-3 py-1 font-sans text-xs font-semibold text-sky-blue">
              18 active today
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
          {isLoading ? (
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
                No farmers match your filters
              </h3>
              <p className="font-sans text-xs text-gray-500 mt-1">
                Try adjusting the trust or crop filter
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <span className="font-sans text-xs text-gray-500">
            Showing {sortedFarmers.length} of 247 farmers
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
