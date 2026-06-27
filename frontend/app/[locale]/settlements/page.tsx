"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/lib/navigation";
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
import { useTranslations } from "next-intl";
import TableSkeleton from "@/components/shared/TableSkeleton";
import StatCardSkeleton from "@/components/shared/StatCardSkeleton";
import { toast } from "sonner";

interface SettlementRecord {
  poolId: string;
  date: string;
  crop: string;
  district: string;
  qtyKg: number;
  winningPrice: number | null;
  mandiAvg: number;
  premiumPct: number | null;
  buyer: string | null;
  farmersCount: number;
  smsSent: boolean;
  status?: "settled" | "expired";
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
    status: "settled",
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
    status: "settled",
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
    status: "settled",
  },
  {
    poolId: "TIR-TOM-007",
    date: "2 days ago",
    crop: "Tomatoes",
    district: "Tiruvannamalai",
    qtyKg: 90,
    winningPrice: null,
    mandiAvg: 12,
    premiumPct: null,
    buyer: null,
    farmersCount: 2,
    smsSent: true,
    status: "expired",
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
    status: "settled",
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
    status: "settled",
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
    status: "settled",
  },
];

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
  "TIR-TOM-007": [
    {
      phone: "+91 91XXX 10008",
      qty: 45,
      text: "Mandi Mitra: Your 45kg tomato lot in Tiruvannamalai did not reach the minimum threshold today. No sale was made. Please call again tomorrow to join the next pool. Ref: TIR-TOM-007",
    },
    {
      phone: "+91 92XXX 10009",
      qty: 45,
      text: "Mandi Mitra: Your 45kg tomato lot in Tiruvannamalai did not reach the minimum threshold today. No sale was made. Please call again tomorrow to join the next pool. Ref: TIR-TOM-007",
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
  const t = useTranslations("settlement");
  const [search, setSearch] = useState("");
  const [crop, setCrop] = useState("all");
  const [district, setDistrict] = useState("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredSettlements = initialSettlements.filter((s) => {
    const matchesCrop = crop === "all" || s.crop === crop;
    const matchesDistrict = district === "all" || s.district === district;
    const matchesSearch =
      s.poolId.toLowerCase().includes(search.toLowerCase()) ||
      (s.buyer?.toLowerCase().includes(search.toLowerCase()) ?? false);

    return matchesCrop && matchesDistrict && matchesSearch;
  });

  const handleRowExpand = (poolId: string) => {
    setExpandedRow((prev) => (prev === poolId ? null : poolId));
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/settlements/export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mandi-mitra-settlements.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      {/* PAGE HEADER */}
      <PageHeader
        title={t("archive_title")}
        subtitle={t("archive_subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-charcoal text-white rounded-lg px-4 py-2 font-sans text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t("export_csv")}</span>
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* STATS OVERVIEW CARDS */}
        <section className="shrink-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={Package}
                value="4,870 kg"
                label="Total Volume Traded"
                sublabel="Across 6 closed pools"
              />
              <StatCard
                icon={TrendingUp}
                value="₹14.2 / kg"
                label="Average Pool Price"
                sublabel="25% average premium vs Mandi"
              />
              <StatCard
                icon={Users}
                value="31"
                label="Farmers Settled"
                sublabel="100% payouts confirmed"
              />
            </div>
          )}
        </section>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pool ID or buyer name..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg font-sans text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all bg-white text-charcoal"
            />
          </div>

          {/* Crop Filter */}
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-gray-655 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
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
            className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-gray-655 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
          >
            <option value="all">All Districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Settlements Table */}
        {isLoading ? (
          <TableSkeleton rows={6} cols={10} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-150 bg-gray-50/50">
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("col_pool_id")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("col_date")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("col_crop")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("col_district")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("col_qty")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("col_price")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("col_premium")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("col_buyer")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                      {t("col_farmers")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                      {t("col_sms")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                      Expand
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {filteredSettlements.map((s) => {
                    const isExpanded = expandedRow === s.poolId;
                    const showPremiumGold = s.premiumPct !== null && s.premiumPct < 10;
                    const nestedRows = subRowFarmers[s.poolId] || defaultSubRow;

                    return (
                      <React.Fragment key={s.poolId}>
                        {/* Main Row */}
                        <tr
                          className={`hover:bg-gray-50/50 transition-colors ${
                            s.status === "expired" ? "opacity-60 bg-gray-50/20" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/dashboard/pool/${s.poolId}`}
                              className="font-mono text-xs font-bold text-sky-blue hover:underline"
                            >
                              {s.poolId}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-555 whitespace-nowrap">
                            {s.date}
                          </td>
                          <td className="px-4 py-3 text-charcoal font-semibold">
                            {s.crop}
                          </td>
                          <td className="px-4 py-3 text-gray-550">{s.district}</td>
                          <td className="px-4 py-3 text-charcoal">
                            <span className="font-display font-bold">
                              {s.qtyKg}
                            </span>{" "}
                            <span className="text-gray-400">kg</span>
                          </td>
                          <td className="px-4 py-3 font-display font-semibold text-sm text-field-green whitespace-nowrap">
                            {s.winningPrice !== null ? (
                              `₹${s.winningPrice}/kg`
                            ) : (
                              <span className="font-sans text-xs text-gray-500 italic font-normal">
                                &mdash; {t("no_deal")}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {s.premiumPct !== null ? (
                              <span
                                className={`inline-block text-[10px] font-bold rounded px-2 py-0.5 ${
                                  showPremiumGold
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-field-green/10 text-field-green"
                                }`}
                              >
                                +{s.premiumPct}%
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-charcoal font-medium">
                            {s.buyer !== null ? (
                              s.buyer
                            ) : (
                              <span className="font-sans text-xs text-gray-500 italic font-normal">
                                {t("pool_expired")}
                              </span>
                            )}
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
                              aria-expanded={isExpanded}
                              aria-controls={`row-detail-${s.poolId}`}
                              className="flex justify-center w-full focus:outline-none cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Nested Expandable Row */}
                        {isExpanded && (
                          <tr id={`row-detail-${s.poolId}`} className="bg-gray-50/70 border-b border-gray-200">
                            <td colSpan={11} className="p-4">
                              <div className="flex flex-col gap-2 w-full">
                                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                                  {t("farmer_receipts")}
                                </span>
                                <div className="overflow-x-auto w-full bg-white rounded-lg border border-gray-150 shadow-sm p-3">
                                  <table className="w-full text-left text-[10px] border-collapse font-sans text-stone-600">
                                    <caption className="sr-only">Farmer Receipts details for pool {s.poolId}</caption>
                                    <thead>
                                      <tr className="border-b border-gray-100 text-gray-500 font-bold">
                                        <th scope="col" className="pb-2">Phone</th>
                                        <th scope="col" className="pb-2">Qty</th>
                                        <th scope="col" className="pb-2">Earnings Est.</th>
                                        <th scope="col" className="pb-2">SMS Text</th>
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
                                            {s.winningPrice !== null ? `₹${f.qty * s.winningPrice}` : "₹0"}
                                          </td>
                                          <td
                                            className="py-2 text-[10px] text-gray-500 italic truncate max-w-[300px]"
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
        )}
      </main>
    </div>
  );
}
