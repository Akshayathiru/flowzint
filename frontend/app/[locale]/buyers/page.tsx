"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { AlertCircle, Package } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import BuyerFilterBar from "@/components/buyers/BuyerFilterBar";
import BuyerCard, { Buyer } from "@/components/buyers/BuyerCard";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";

interface BackendBuyer {
  buyer_id: number;
  name: string;
  phone: string;
  crop: string;
  location: string;
  min_quantity: number;
  suspended?: boolean;
  transaction_count?: number;
}

export default function BuyerRegistryPage() {
  const t = useTranslations("buyer");
  const { isViewer } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [crop, setCrop] = useState("all");
  const [district, setDistrict] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const fetchBuyers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/buyers`
      );
      const data = await res.json();
      // Backend returns {"message": "No buyers found"} if empty, not an array
      if (Array.isArray(data)) {
        setBuyers(
          (data as BackendBuyer[]).map((b) => ({
            id: String(b.buyer_id),
            name: b.name,
            phone: b.phone,
            districts: [b.location],
            crops: [{ name: b.crop, minQtyKg: b.min_quantity }],
            lastWin: null,
            active: !b.suspended,
            totalAuctions: b.transaction_count || 0,
          }))
        );
      } else {
        setBuyers([]);
      }
    } catch (err) {
      console.error("Failed to load buyers:", err);
      setError("Could not load buyers from backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

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
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="border border-gray-200 rounded-full px-3 py-1 font-sans text-xs font-semibold text-gray-500 bg-white select-none">
              {buyers.length} registered buyer{buyers.length === 1 ? "" : "s"}
            </span>
            {!isViewer && (
              <Link
                href="/buyers/register"
                className="bg-charcoal text-white rounded-lg px-4 py-2 font-sans text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm"
              >
                + {t("register_button")}
              </Link>
            )}
          </div>
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

        {/* ERROR STATE */}
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto text-center shadow-sm">
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
        ) : isLoading ? (
          /* LOADING SKELETON */
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse space-y-3">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-3 bg-gray-50 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredBuyers.length > 0 ? (
          /* Buyer Cards List */
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
              {buyers.length === 0 ? "No buyers registered yet" : "No buyers match your filters"}
            </h3>
            <p className="font-sans text-xs text-gray-500 mt-1">
              {buyers.length === 0 ? "Register a buyer to get started" : "Try adjusting the crop or district filter"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
