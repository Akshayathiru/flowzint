"use client";

// TODO: replace callback execution with useMutation('/api/pools/callbacks/trigger')

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  TrendingUp,
  Package,
  Users,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { CROPS, DISTRICTS } from "@/lib/constants";

interface SettlementRecord {
  poolId: string;
  date: string;
  crop: string;
  district: string;
  qtyKg: number;
  winningPrice: number;
  mandiAvg: number;
  premiumPct: number;
  buyer: string;
  farmersCount: number;
  smsSent: boolean;
}

const initialSettlements: SettlementRecord[] = [
  {
    poolId: "KAN-TOM-001",
    date: "Today 09:45",
    crop: "Tomatoes",
    district: "Kanchipuram",
    qtyKg: 1020,
    winningPrice: 15,
    mandiAvg: 12,
    premiumPct: 25,
    buyer: "Ramesh Traders",
    farmersCount: 6,
    smsSent: true,
  },
  {
    poolId: "VEL-ONI-002",
    date: "Today 08:12",
    crop: "Onions",
    district: "Vellore",
    qtyKg: 640,
    winningPrice: 19,
    mandiAvg: 17,
    premiumPct: 12,
    buyer: "Sri Lakshmi Wholesale",
    farmersCount: 4,
    smsSent: true,
  },
  {
    poolId: "CHE-POT-003",
    date: "Yesterday",
    crop: "Potatoes",
    district: "Chengalpattu",
    qtyKg: 880,
    winningPrice: 22,
    mandiAvg: 20,
    premiumPct: 10,
    buyer: "Murugan Agro",
    farmersCount: 7,
    smsSent: true,
  },
  {
    poolId: "SAL-CHI-004",
    date: "Yesterday",
    crop: "Chillies",
    district: "Salem",
    qtyKg: 210,
    winningPrice: 48,
    mandiAvg: 42,
    premiumPct: 14,
    buyer: "Ramesh Traders",
    farmersCount: 3,
    smsSent: false,
  },
  {
    poolId: "KAN-TOM-005",
    date: "2 days ago",
    crop: "Tomatoes",
    district: "Kanchipuram",
    qtyKg: 750,
    winningPrice: 13,
    mandiAvg: 12,
    premiumPct: 8,
    buyer: "Ramesh Traders",
    farmersCount: 5,
    smsSent: true,
  },
  {
    poolId: "TIR-BRI-006",
    date: "3 days ago",
    crop: "Brinjal",
    district: "Tiruvannamalai",
    qtyKg: 390,
    winningPrice: 16,
    mandiAvg: 14,
    premiumPct: 14,
    buyer: "Sri Lakshmi Wholesale",
    farmersCount: 4,
    smsSent: true,
  },
];

// Helper to resolve dates for mock relative strings
const getMockDate = (dateStr: string): Date => {
  const now = new Date();
  if (dateStr.includes("Today")) {
    return now;
  }
  if (dateStr === "Yesterday") {
    now.setDate(now.getDate() - 1);
    return now;
  }
  if (dateStr.includes("2 days ago")) {
    now.setDate(now.getDate() - 2);
    return now;
  }
  if (dateStr.includes("3 days ago")) {
    now.setDate(now.getDate() - 3);
    return now;
  }
  return now;
};

// Sub-row mock farmer list for expanded view
const subRowFarmers: Record<
  string,
  { phone: string; qty: number; text: string }[]
> = {
  "KAN-TOM-001": [
    {
      phone: "+91 98XXX 10001",
      qty: 200,
      text: "Mandi Mitra: Your 200kg tomatoes sold at Rs.15/kg. Ref KAN-TOM-001",
    },
    {
      phone: "+91 97XXX 10002",
      qty: 350,
      text: "Mandi Mitra: Your 350kg tomatoes sold at Rs.15/kg. Ref KAN-TOM-001",
    },
    {
      phone: "+91 95XXX 10004",
      qty: 220,
      text: "Mandi Mitra: Your 220kg tomatoes sold at Rs.15/kg. Ref KAN-TOM-001",
    },
  ],
  "VEL-ONI-002": [
    {
      phone: "+91 97XXX 10002",
      qty: 180,
      text: "Mandi Mitra: Your 180kg onions sold at Rs.19/kg. Ref VEL-ONI-002",
    },
    {
      phone: "+91 93XXX 10006",
      qty: 140,
      text: "Mandi Mitra: Your 140kg onions sold at Rs.19/kg. Ref VEL-ONI-002",
    },
    {
      phone: "+91 91XXX 10008",
      qty: 320,
      text: "Mandi Mitra: Your 320kg onions sold at Rs.19/kg. Ref VEL-ONI-002",
    },
  ],
};

const defaultSubRow = [
  {
    phone: "+91 99XXX 99999",
    qty: 150,
    text: "Mandi Mitra: Your 150kg crop sold successfully. Ref KAN-TOM-XXX",
  },
  {
    phone: "+91 88XXX 88888",
    qty: 200,
    text: "Mandi Mitra: Your 200kg crop sold successfully. Ref KAN-TOM-XXX",
  },
  {
    phone: "+91 77XXX 77777",
    qty: 100,
    text: "Mandi Mitra: Your 100kg crop sold successfully. Ref KAN-TOM-XXX",
  },
];

export default function SettlementsArchivePage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeekStr = lastWeekDate.toISOString().split("T")[0];

  const [from, setFrom] = useState(lastWeekStr);
  const [to, setTo] = useState(todayStr);
  const [crop, setCrop] = useState("all");
  const [district, setDistrict] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredSettlements = initialSettlements.filter((s) => {
    // Date Range
    const dateObj = getMockDate(s.date);
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
      if (dateObj < fromDate) return false;
    }
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
      if (dateObj > toDate) return false;
    }

    // Crop
    const matchesCrop = crop === "all" || s.crop === crop;

    // District
    const matchesDistrict = district === "all" || s.district === district;

    // Search
    const matchesSearch =
      s.poolId.toLowerCase().includes(search.toLowerCase()) ||
      s.buyer.toLowerCase().includes(search.toLowerCase());

    return matchesCrop && matchesDistrict && matchesSearch;
  });

  const handleRowExpand = (poolId: string) => {
    setExpandedRow((prev) => (prev === poolId ? null : poolId));
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      {/* PAGE HEADER */}
      <PageHeader
        title="Settlement Archive"
        subtitle="Every completed pool transaction"
        actions={
          <div className="flex flex-wrap gap-2.5 select-none">
            <span className="border border-gray-200 rounded-full px-3 py-1 font-sans text-xs font-semibold text-gray-500 bg-white shadow-sm flex items-center">
              128 total
            </span>
            <span className="bg-field-green/10 border border-field-green/20 rounded-full px-3 py-1 font-sans text-xs font-semibold text-field-green shadow-sm flex items-center">
              ₹14.2 avg/kg this week
            </span>
            {/* Link / Call to /api/settlements/export directly */}
            <a
              href="/api/settlements/export"
              download
              className="border border-gray-200 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-650 hover:bg-gray-50 bg-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              Export CSV
            </a>
          </div>
        }
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors flex flex-wrap items-center gap-3">
          {/* From Date */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 font-sans text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-350 bg-white"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 font-sans text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-355 bg-white"
            />
          </div>

          {/* Crop Filter */}
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
          >
            <option value="all">All Crops</option>
            {CROPS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* District Filter */}
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
          >
            <option value="all">All Districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px]">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Pool ID or buyer name..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg font-sans text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal"
            />
          </div>
        </div>

        {/* Summary Stat Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CheckCircle}
            value="12"
            label="Settled Today"
            sublabel="3 pools · 4 crops"
          />
          <StatCard
            icon={TrendingUp}
            value="₹15.2"
            label="Highest Price Today"
            sublabel="Tomatoes · Kanchipuram"
            trend="up"
          />
          <StatCard
            icon={Package}
            value="4,820 kg"
            label="Total Qty Settled Today"
            sublabel="Across 3 districts"
          />
          <StatCard
            icon={Users}
            value="38"
            label="Farmers Paid Today"
            sublabel="SMS receipts sent"
          />
        </section>

        {/* Settlements Table container */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Pool ID
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Crop
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    District
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Winning Price
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Premium
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                    Farmers
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                    SMS
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                    Expand
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filteredSettlements.map((s) => {
                  const isExpanded = expandedRow === s.poolId;
                  const showPremiumGold = s.premiumPct < 10;
                  const nestedRows = subRowFarmers[s.poolId] || defaultSubRow;

                  return (
                    <React.Fragment key={s.poolId}>
                      {/* Main Row */}
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/pool/${s.poolId}`}
                            className="font-mono text-xs font-bold text-sky-blue hover:underline"
                          >
                            {s.poolId}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-455 whitespace-nowrap">
                          {s.date}
                        </td>
                        <td className="px-4 py-3 text-charcoal font-semibold">
                          {s.crop}
                        </td>
                        <td className="px-4 py-3 text-gray-450">{s.district}</td>
                        <td className="px-4 py-3 text-charcoal">
                          <span className="font-display font-bold">
                            {s.qtyKg}
                          </span>{" "}
                          <span className="text-gray-400">kg</span>
                        </td>
                        <td className="px-4 py-3 font-display font-semibold text-sm text-field-green whitespace-nowrap">
                          ₹{s.winningPrice}/kg
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block text-[10px] font-bold rounded px-2 py-0.5 ${
                              showPremiumGold
                                ? "bg-amber-50 text-amber-600"
                                : "bg-field-green/10 text-field-green"
                            }`}
                          >
                            +{s.premiumPct}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-charcoal font-medium">
                          {s.buyer}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-center font-medium">
                          {s.farmersCount} farmers
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            {s.smsSent ? (
                              <CheckCircle className="w-3.5 h-3.5 text-field-green" />
                            ) : (
                              <span title="Pending">
                                <Clock className="w-3.5 h-3.5 text-amber-500 cursor-help" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRowExpand(s.poolId)}
                            className="flex justify-center w-full focus:outline-none cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 transition-transform duration-200" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Nested Expandable Row */}
                      {isExpanded && (
                        <tr className="bg-gray-50/70 border-b border-gray-200">
                          <td colSpan={11} className="p-4">
                            <div className="flex flex-col gap-2 w-full">
                              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                                Farmer Receipts
                              </span>
                              <div className="overflow-x-auto w-full bg-white rounded-lg border border-gray-150 shadow-sm p-3">
                                <table className="w-full text-left text-[10px] border-collapse font-sans text-stone-600">
                                  <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 font-bold">
                                      <th className="pb-2">Phone</th>
                                      <th className="pb-2">Qty</th>
                                      <th className="pb-2">Earnings Est.</th>
                                      <th className="pb-2">SMS Text</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {nestedRows.map((f, idx) => (
                                      <tr key={idx}>
                                        <td className="py-2 font-mono text-[10px] text-sky-blue font-medium">
                                          <Link
                                            href={`/farmers/${encodeURIComponent(f.phone)}`}
                                            className="hover:underline"
                                          >
                                            {f.phone}
                                          </Link>
                                        </td>
                                        <td className="py-2 text-[10px]">
                                          {f.qty} kg
                                        </td>
                                        <td className="py-2 font-display font-semibold text-[10px] text-field-green">
                                          ₹{f.qty * s.winningPrice}
                                        </td>
                                        <td
                                          className="py-2 text-[10px] text-gray-400 italic truncate max-w-[300px]"
                                          title={f.text}
                                        >
                                          {f.text}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Row */}
        <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <span className="font-sans text-xs text-gray-400">
            Showing {filteredSettlements.length} of 128 settlements
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="border border-gray-200 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-400 bg-gray-50/50 cursor-not-allowed opacity-40"
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
