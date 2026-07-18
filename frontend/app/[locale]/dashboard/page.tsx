"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/lib/navigation";
import dynamic from "next/dynamic";
import { Layers, Phone, CheckCircle, AlertCircle } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import PoolCard from "@/components/pool/PoolCard";
import LiveEventFeed from "@/components/feed/LiveEventFeed";
import PageHeader from "@/components/shared/PageHeader";
import DemoTriggerButton from "@/components/demo/DemoTriggerButton";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import StatCardSkeleton from "@/components/shared/StatCardSkeleton";
import PoolCardSkeleton from "@/components/shared/PoolCardSkeleton";
import { useQuery } from "@tanstack/react-query";
import { usePools } from "@/hooks/usePools";

const MandiMap = dynamic(() => import("@/components/map/MandiMap"), {
  ssr: false,
});

export default function Dashboard() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { data: stats, isError: isStatsError } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 3000
  });

  const { data: activePools, isLoading: isLoadingPools, isError: isPoolsError } = usePools();

  useEffect(() => {
    if (stats || activePools) {
      setLastUpdated(new Date());
    }
  }, [stats, activePools]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="lg:h-screen lg:overflow-hidden flex flex-col bg-warm-cream relative">
      {/* PAGE HEADER */}
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex items-center gap-3 select-none">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-250 bg-emerald-50/50 text-field-green">
              <span className="h-1.5 w-1.5 rounded-full bg-field-green animate-pulse" />
              LIVE
            </span>
            <Link
              href="/demo"
              className="border border-gray-300 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-500 hover:bg-gray-50 active:bg-gray-100 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              + New Demo Call
            </Link>
          </div>
        }
      />

      {/* INLINE WARNING BANNER */}
      {(isStatsError || isPoolsError) && (
        <div className="mx-6 mt-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-alert-red shrink-0" />
            <span>Could not load live data</span>
          </div>
          <span className="text-[10px] text-gray-500 font-normal">Retrying automatically...</span>
        </div>
      )}

      {/* STAT CARDS ROW */}
      <section className="px-6 pt-5 pb-4 shrink-0">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={Layers}
              value={String(stats?.activePoolsCount ?? 0)}
              label={t("active_pools")}
              sublabel="2 filling · 1 auctioning"
            />
            <StatCard
              icon={Phone}
              value={String(stats?.liveBuyerCallsCount ?? 0)}
              label={t("buyer_calls")}
              sublabel="Bulbul outbound in progress"
            />
            <StatCard
              icon={CheckCircle}
              value={String(stats?.settlementsCount ?? 0)}
              label={t("settlements_today")}
              sublabel="↑ 4 from yesterday"
              trend="up"
            />
          </div>
        )}
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-6 pb-6 overflow-y-auto lg:overflow-hidden min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 h-full">
          {/* LEFT PANEL */}
          <div className="flex flex-col gap-5 lg:overflow-y-auto lg:h-full pb-6 pr-1">
            <div>
              <h2 className="font-sans text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-3">
                {t("active_pools")}
              </h2>
              {isLoading || isLoadingPools ? (
                <div className="flex flex-col gap-4">
                  <PoolCardSkeleton />
                  <PoolCardSkeleton />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {activePools && activePools.length > 0 ? (
                    activePools.map((pool) => (
                      <PoolCard
                        key={pool.poolId}
                        poolId={pool.poolId}
                        crop={pool.crop}
                        location={pool.location}
                        currentQtyKg={pool.currentQtyKg}
                        targetQtyKg={pool.targetQtyKg}
                        farmersCount={pool.farmersCount}
                        minutesRemaining={pool.minutesRemaining}
                        status={pool.status}
                      />
                    ))
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                      <Layers className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="font-sans text-sm text-gray-500">No active pools at the moment</p>
                      <p className="font-sans text-xs text-gray-400 mt-1">
                        New pools appear here as farmers call in
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col min-h-[280px]">
              <LiveEventFeed />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="hidden lg:flex flex-col gap-5 lg:overflow-y-auto lg:h-full pb-6">
            <MandiMap />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors">
              <h3 className="font-sans text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-3">
                {t("quick_actions")}
              </h3>
              <div className="flex flex-col divide-y divide-gray-100">
                <div className="flex justify-between items-center py-3">
                  <span className="font-sans text-xs font-semibold text-gray-600">
                    {t("trigger_demo_call")}
                  </span>
                  <Link
                    href="/demo"
                    className="border border-gray-200 rounded px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 active:bg-gray-100 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  >
                    {t("launch_button")}
                  </Link>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-sans text-xs font-semibold text-gray-600">
                    {t("buyer_registry")}
                  </span>
                  <Link
                    href="/buyers"
                    className="border border-gray-200 rounded px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 active:bg-gray-100 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  >
                    {t("open_button")}
                  </Link>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-sans text-xs font-semibold text-gray-600">
                    {t("settlement_archive")}
                  </span>
                  <Link
                    href="/settlements"
                    className="border border-gray-200 rounded px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 active:bg-gray-100 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  >
                    {t("view_button")}
                  </Link>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-sans text-xs font-semibold text-gray-600">
                    {t("retry_failed_callbacks")}
                  </span>
                  <button
                    onClick={() => {
                      toast.success(t("retry_toast"));
                    }}
                    className="border border-gray-200 rounded px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 cursor-pointer"
                  >
                    {t("retry_button")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-right mt-4 pr-6 select-none" style={{ fontFamily: 'Inter' }}>
          Last updated: {lastUpdated.toLocaleTimeString(locale)}
        </p>
      </main>

      {/* Floating Demo trigger button */}
      <DemoTriggerButton />
    </div>
  );
}


