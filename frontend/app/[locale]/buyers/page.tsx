"use client";

import React, { useState } from "react";
import { Link } from "@/lib/navigation";
import { Package } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import BuyerFilterBar from "@/components/buyers/BuyerFilterBar";
import BuyerCard, { Buyer } from "@/components/buyers/BuyerCard";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";

const initialBuyers: Buyer[] = [
  {
    id: "B001",
    name: "Ramesh Traders",
    phone: "+91 80XXX 20001",
    districts: ["Kanchipuram"],
    crops: [
      { name: "Tomatoes", minQtyKg: 200 },
      { name: "Onions", minQtyKg: 150 },
    ],
    lastWin: { price: 15, crop: "Tomatoes", daysAgo: 3 },
    active: true,
    totalAuctions: 14,
  },
  {
    id: "B002",
    name: "Sri Lakshmi Wholesale",
    phone: "+91 79XXX 20002",
    districts: ["Vellore", "Tiruvannamalai"],
    crops: [{ name: "Onions", minQtyKg: 300 }],
    lastWin: { price: 18, crop: "Onions", daysAgo: 7 },
    active: true,
    totalAuctions: 8,
  },
  {
    id: "B003",
    name: "Murugan Agro Processors",
    phone: "+91 98XXX 20003",
    districts: ["Kanchipuram", "Chengalpattu"],
    crops: [
      { name: "Tomatoes", minQtyKg: 500 },
      { name: "Chillies", minQtyKg: 100 },
    ],
    lastWin: null,
    active: false,
    totalAuctions: 2,
  },
];

export default function BuyerRegistryPage() {
  const t = useTranslations("buyer");
  const { isViewer } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>(initialBuyers);
  const [search, setSearch] = useState("");
  const [crop, setCrop] = useState("all");
  const [district, setDistrict] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredBuyers = buyers.filter((buyer) => {
    const matchesSearch =
      buyer.name.toLowerCase().includes(search.toLowerCase()) ||
      buyer.phone.toLowerCase().includes(search.toLowerCase());

    const matchesCrop =
      crop === "all" || buyer.crops.some((c) => c.name === crop);

    const matchesDistrict =
      district === "all" || buyer.districts.includes(district);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && buyer.active) ||
      (statusFilter === "inactive" && !buyer.active);

    return matchesSearch && matchesCrop && matchesDistrict && matchesStatus;
  });

  const handleToggleActive = (id: string) => {
    if (isViewer) return;
    setBuyers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      {/* PAGE HEADER */}
      <PageHeader
        title={t("registry_title")}
        subtitle={t("registry_subtitle")}
        actions={
          !isViewer ? (
            <Link
              href="/buyers/register"
              className="bg-charcoal text-white rounded-lg px-4 py-2 font-sans text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm"
            >
              + {t("register_button")}
            </Link>
          ) : undefined
        }
      />

      {/* Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Filter Bar */}
        <BuyerFilterBar
          search={search}
          setSearch={setSearch}
          crop={crop}
          setCrop={setCrop}
          district={district}
          setDistrict={setDistrict}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Buyer Cards List */}
        {filteredBuyers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredBuyers.map((buyer) => (
              <BuyerCard
                key={buyer.id}
                buyer={buyer}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center text-center shadow-sm">
            <Package className="w-8 h-8 text-gray-300" />
            <h3 className="font-display font-semibold text-sm text-gray-500 mt-3">
              No buyers match your filters
            </h3>
            <p className="font-sans text-xs text-gray-500 mt-1">
              Try adjusting the crop or district filter
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
