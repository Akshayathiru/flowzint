"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Layers, Phone, CheckCircle } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import PoolCard from "@/components/pool/PoolCard";
import LiveEventFeed from "@/components/feed/LiveEventFeed";
import PageHeader from "@/components/shared/PageHeader";
import DemoTriggerButton from "@/components/demo/DemoTriggerButton";

const MandiMap = dynamic(() => import("@/components/map/MandiMap"), {
  ssr: false,
});

export default function Dashboard() {
  return (
    <div className="lg:h-screen lg:overflow-hidden flex flex-col bg-warm-cream relative">
      {/* PAGE HEADER */}
      <PageHeader
        title="Live Dashboard"
        subtitle="Real-time pool and auction monitor"
        actions={
          <div className="flex items-center gap-3 select-none">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-250 bg-emerald-50/50 text-field-green">
              <span className="h-1.5 w-1.5 rounded-full bg-field-green animate-pulse" />
              LIVE
            </span>
            <Link
              href="/demo"
              className="border border-gray-300 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-500 hover:bg-gray-50 bg-white transition-colors"
            >
              + New Demo Call
            </Link>
          </div>
        }
      />

      {/* STAT CARDS ROW */}
      {/* TODO: replace hardcoded values with useQuery('/api/pools/active') */}
      <section className="px-6 pt-5 pb-4 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Layers}
            value="3"
            label="Active Pools"
            sublabel="2 filling · 1 auctioning"
          />
          <StatCard
            icon={Phone}
            value="1"
            label="Buyer Calls Live"
            sublabel="Bulbul outbound in progress"
          />
          <StatCard
            icon={CheckCircle}
            value="12"
            label="Settlements Today"
            sublabel="↑ 4 from yesterday"
            trend="up"
          />
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-6 pb-6 overflow-y-auto lg:overflow-hidden min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 h-full">
          {/* LEFT PANEL */}
          <div className="flex flex-col gap-5 lg:overflow-y-auto lg:h-full pb-6 pr-1">
            <div>
              <h2 className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                Active Pools
              </h2>
              <div className="flex flex-col gap-4">
                <PoolCard
                  poolId="KAN-TOM-001"
                  crop="Tomatoes"
                  location="Kanchipuram"
                  currentQtyKg={820}
                  targetQtyKg={1000}
                  farmersCount={6}
                  minutesRemaining={47}
                  status="filling"
                />
                <PoolCard
                  poolId="VEL-ONI-002"
                  crop="Onions"
                  location="Vellore"
                  currentQtyKg={312}
                  targetQtyKg={500}
                  farmersCount={4}
                  minutesRemaining={61}
                  status="auctioning"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[280px]">
              {/* TODO: replace with usePoolSocket() WebSocket subscription */}
              <LiveEventFeed />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="hidden lg:flex flex-col gap-5 lg:overflow-y-auto lg:h-full pb-6">
            <MandiMap />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors">
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                Quick Actions
              </h3>
              <div className="flex flex-col divide-y divide-gray-100">
                <div className="flex justify-between items-center py-3">
                  <span className="font-sans text-xs font-semibold text-gray-600">
                    Trigger Demo Call
                  </span>
                  <Link
                    href="/demo"
                    className="border border-gray-200 rounded px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 bg-white transition-colors"
                  >
                    Launch
                  </Link>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-sans text-xs font-semibold text-gray-600">
                    Buyer Registry
                  </span>
                  <Link
                    href="/buyers"
                    className="border border-gray-200 rounded px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 bg-white transition-colors"
                  >
                    Open
                  </Link>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-sans text-xs font-semibold text-gray-600">
                    Settlement Archive
                  </span>
                  <Link
                    href="/settlements"
                    className="border border-gray-200 rounded px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 bg-white transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Demo trigger button */}
      <DemoTriggerButton />
    </div>
  );
}
