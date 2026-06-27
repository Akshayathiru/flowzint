"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Gavel,
  Zap,
  MessageSquare,
  Loader2,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import { CROPS, DISTRICTS } from "@/lib/constants";
import { getSocket } from "@/lib/socket";
import { DemoTriggerCallSchema, DemoInjectBidSchema } from "@/lib/schemas";
import LanguageBadge from "@/components/shared/LanguageBadge";

interface DemoEvent {
  time: string;
  type: "farmer_call" | "buyer_bid" | "pool_close" | "callback_sent" | "settlement";
  message: string;
  lang?: string;
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal";

export default function DemoControlPanelPage() {
  const isDemoModeEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // Timeline script expansion
  const [scriptExpanded, setScriptExpanded] = useState(true);

  // Loading states
  const [loadingCall, setLoadingCall] = useState(false);
  const [loadingBid, setLoadingBid] = useState(false);
  const [loadingClose, setLoadingClose] = useState(false);
  const [loadingCallbacks, setLoadingCallbacks] = useState(false);

  // Local Event Log
  const [demoEvents, setDemoEvents] = useState<DemoEvent[]>([]);

  // Form states
  const [callPhone, setCallPhone] = useState("+91 9876540001");
  const [callCrop, setCallCrop] = useState("Tomatoes");
  const [callQty, setCallQty] = useState("200");
  const [callLang, setCallLang] = useState("ta");

  const [bidPool, setBidPool] = useState("KAN-TOM-001");
  const [bidBuyer, setBidBuyer] = useState("Buyer A (Ramesh Traders)");
  const [bidPrice, setBidPrice] = useState("14");

  const [closePool, setClosePool] = useState("KAN-TOM-001");
  const [closeReason, setCloseReason] = useState("Threshold reached");

  const [callbackPool, setCallbackPool] = useState("KAN-TOM-001");

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().split(" ")[0].substring(0, 5);
  };

  const handleTriggerCall = () => {
    setLoadingCall(true);
    
    // Trigger REST API call
    fetch("/api/demo/trigger-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: callPhone,
        crop: callCrop,
        qtyKg: parseFloat(callQty),
        language: callLang,
        districtCode: "KAN",
      }),
    }).catch(() => {});

    // TODO: backend must listen for this event and broadcast pool:update + feed:event to all connected clients
    const socket = getSocket();
    socket.emit("demo:trigger_call", {
      phone: callPhone,
      crop: callCrop,
      qtyKg: parseFloat(callQty),
      language: callLang,
      districtCode: "KAN", // TODO: derive from crop/district selection
    });

    setTimeout(() => {
      setLoadingCall(false);
      const phoneNum = callPhone || "+91 9876540001";
      const cropVal = callCrop;
      const qtyVal = callQty || "200";
      const districtVal = DISTRICTS[0]; // Kanchipuram
      const langLabel =
        callLang === "ta"
          ? "Tamil"
          : callLang === "te"
          ? "Telugu"
          : callLang === "hi"
          ? "Hindi"
          : "Kannada";

      const newEvent: DemoEvent = {
        time: getCurrentTime(),
        type: "farmer_call",
        message: `Farmer ${phoneNum} called in — ${qtyVal}kg ${cropVal}, ${districtVal}`,
        lang: callLang,
      };

      setDemoEvents((prev) => [newEvent, ...prev]);
      toast.success(`Farmer call triggered — ${cropVal} ${qtyVal}kg in ${langLabel}`);
    }, 800);
  };

  const handleInjectBid = () => {
    setLoadingBid(true);
    
    // Trigger REST API call
    fetch("/api/demo/inject-bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        poolId: bidPool,
        buyerId: bidBuyer,
        pricePerKg: parseFloat(bidPrice),
      }),
    }).catch(() => {});

    // TODO: backend must listen for this event and broadcast pool:update + feed:event to all connected clients
    const socket = getSocket();
    socket.emit("demo:inject_bid", {
      poolId: bidPool,
      buyerId: bidBuyer,
      pricePerKg: parseFloat(bidPrice),
    });

    setTimeout(() => {
      setLoadingBid(false);
      const poolVal = bidPool;
      const buyerName = bidBuyer.split(" ")[0] + " " + bidBuyer.split(" ")[1];
      const priceVal = bidPrice || "14";

      const newEvent: DemoEvent = {
        time: getCurrentTime(),
        type: "buyer_bid",
        message: `Bulbul called ${buyerName} — ₹${priceVal}/kg offer received on ${poolVal}`,
      };

      setDemoEvents((prev) => [newEvent, ...prev]);
      toast.success(`Bid injected — ${buyerName} offered ₹${priceVal}/kg on ${poolVal}`);
    }, 605);
  };

  const handleForceClose = () => {
    setLoadingClose(true);
    // TODO: POST /api/demo/close-pool
    setTimeout(() => {
      setLoadingClose(false);
      const poolVal = closePool;

      const newEvent: DemoEvent = {
        time: getCurrentTime(),
        type: "pool_close",
        message: `Pool ${poolVal} closed manually — status set to AUCTIONING`,
      };

      setDemoEvents((prev) => [newEvent, ...prev]);
      toast.success(`Pool ${poolVal} closed — status set to AUCTIONING`);
    }, 800);
  };

  const handleSendCallbacks = () => {
    setLoadingCallbacks(true);
    // TODO: POST /api/demo/send-callbacks
    setTimeout(() => {
      setLoadingCallbacks(false);
      const poolVal = callbackPool;

      const newEvent: DemoEvent = {
        time: getCurrentTime(),
        type: "callback_sent",
        message: `Callbacks sent — All farmers in pool ${poolVal} notified of price confirmation`,
      };

      setDemoEvents((prev) => [newEvent, ...prev]);
      toast.success(`Callbacks sent — Farmers in pool ${poolVal} notified in Tamil, Telugu, Hindi`);
    }, 1000);
  };

  const handleResetAll = () => {
    setDemoEvents([]);
    toast.success("Demo control state reset successfully");
  };

  const getDotColorClass = (type: DemoEvent["type"]) => {
    switch (type) {
      case "farmer_call":
        return "bg-sky-blue";
      case "buyer_bid":
        return "bg-harvest-gold";
      case "pool_close":
        return "bg-soil-brown";
      case "callback_sent":
        return "bg-field-green";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans relative">
      {/* Demo Disabled Alert Banner */}
      {!isDemoModeEnabled && (
        <div className="bg-alert-red text-white text-center py-2 px-4 font-sans text-xs font-semibold tracking-wider uppercase select-none z-30 shadow-sm">
          Demo mode is disabled. Set NEXT_PUBLIC_DEMO_MODE=true to enable.
        </div>
      )}

      {/* PAGE HEADER */}
      <PageHeader
        title="Demo Control Panel"
        subtitle="Trigger simulated events for live demo"
        actions={
          <div className="flex items-center gap-2 select-none">
            <span className="bg-harvest-gold text-soil-brown text-[10px] font-bold rounded-full px-2.5 py-0.5 uppercase tracking-wider">
              Demo Mode
            </span>
            <Link
              href="/dashboard"
              className="border border-gray-200 rounded-lg px-4 py-2 font-sans text-xs font-semibold text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition-colors"
            >
              View Dashboard &rarr;
            </Link>
            <button
              onClick={handleResetAll}
              className="border border-alert-red/30 text-alert-red rounded-lg px-4 py-2 font-sans text-xs font-semibold hover:bg-red-50 bg-white shadow-sm transition-colors cursor-pointer"
            >
              Reset All
            </button>
          </div>
        }
      />

      {/* Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">

        {/* DEMO SCRIPT BANNER */}
        <div className="bg-charcoal rounded-xl p-5 text-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="font-display font-semibold text-sm">
              Demo Script &mdash; 5 Minutes
            </span>
            <button
              onClick={() => setScriptExpanded(!scriptExpanded)}
              className="font-sans text-xs text-gray-400 hover:text-white transition-colors"
            >
              {scriptExpanded ? "Collapse" : "Expand"}
            </button>
          </div>

          {scriptExpanded && (
            <div className="flex flex-col lg:flex-row items-stretch lg:items-start justify-between gap-4 mt-6 relative z-0">
              {/* Timeline Connector Line */}
              <div className="hidden lg:block absolute left-[5%] right-[5%] top-[14px] h-[1px] bg-gray-700 -z-10" />

              {/* Steps */}
              {[
                { time: "T+0:00", label: "Open landing page" },
                { time: "T+0:30", label: "Trigger Tamil farmer call" },
                { time: "T+1:00", label: "Add Telugu + Hindi farmers" },
                { time: "T+1:30", label: "Close pool -> auction" },
                { time: "T+2:00", label: "Inject Buyer A bid ₹14" },
                { time: "T+2:30", label: "Inject Buyer B bid ₹15 -> winner" },
                { time: "T+3:00", label: "Send farmer callbacks" },
                { time: "T+3:30", label: "Settlement card appears" },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex lg:flex-col items-center lg:text-center gap-3 lg:gap-0 flex-1 max-w-[120px] mx-auto w-full"
                >
                  <div className="w-7 h-7 rounded-full bg-harvest-gold text-soil-brown font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex flex-col lg:mt-2 text-left lg:text-center">
                    <span className="font-mono text-[9px] text-gray-400 font-bold">
                      {step.time}
                    </span>
                    <span className="font-sans text-[10px] text-gray-300 mt-0.5 leading-snug">
                      {step.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOUR ACTION PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PANEL 1: Trigger Farmer Call */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-blue shrink-0" />
                <h3 className="font-display font-semibold text-sm text-charcoal">
                  Trigger Farmer Call
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={callPhone}
                    onChange={(e) => setCallPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Crop
                  </label>
                  <select
                    value={callCrop}
                    onChange={(e) => setCallCrop(e.target.value)}
                    className={inputClass}
                  >
                    {CROPS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    value={callQty}
                    onChange={(e) => setCallQty(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Language
                  </label>
                  <select
                    value={callLang}
                    onChange={(e) => setCallLang(e.target.value)}
                    className={inputClass}
                  >
                    <option value="ta">Tamil (ta)</option>
                    <option value="te">Telugu (te)</option>
                    <option value="hi">Hindi (hi)</option>
                    <option value="kn">Kannada (kn)</option>
                    <option value="mr">Marathi (mr)</option>
                    <option value="bn">Bengali (bn)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerCall}
              disabled={loadingCall}
              className="bg-sky-blue text-white w-full rounded-lg py-2.5 mt-5 font-sans font-semibold text-xs hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loadingCall ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Phone className="w-3.5 h-3.5" />
              )}
              {loadingCall ? "Triggering..." : "Trigger Call"}
            </button>
          </div>

          {/* PANEL 2: Inject Buyer Bid */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-harvest-gold shrink-0" />
                <h3 className="font-display font-semibold text-sm text-charcoal">
                  Inject Buyer Bid
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Pool
                  </label>
                  <select
                    value={bidPool}
                    onChange={(e) => setBidPool(e.target.value)}
                    className={inputClass}
                  >
                    <option value="KAN-TOM-001">KAN-TOM-001</option>
                    <option value="VEL-ONI-002">VEL-ONI-002</option>
                    <option value="CHE-POT-003">CHE-POT-003</option>
                  </select>
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Buyer
                  </label>
                  <select
                    value={bidBuyer}
                    onChange={(e) => setBidBuyer(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Buyer A (Ramesh Traders)">
                      Buyer A (Ramesh Traders)
                    </option>
                    <option value="Buyer B (Sri Lakshmi Wholesale)">
                      Buyer B (Sri Lakshmi Wholesale)
                    </option>
                    <option value="Buyer C (Murugan Agro)">
                      Buyer C (Murugan Agro)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Bid Price (₹/kg)
                  </label>
                  <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleInjectBid}
              disabled={loadingBid}
              className="bg-harvest-gold text-soil-brown w-full rounded-lg py-2.5 mt-5 font-sans font-semibold text-xs hover:brightness-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loadingBid ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Gavel className="w-3.5 h-3.5" />
              )}
              {loadingBid ? "Injecting..." : "Inject Bid"}
            </button>
          </div>

          {/* PANEL 3: Force Pool Close */}
          <div className="bg-white rounded-xl border border-gray-200 border-l-2 border-l-soil-brown p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-soil-brown shrink-0" />
                <h3 className="font-display font-semibold text-sm text-charcoal">
                  Force Pool Close
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Pool
                  </label>
                  <select
                    value={closePool}
                    onChange={(e) => setClosePool(e.target.value)}
                    className={inputClass}
                  >
                    <option value="KAN-TOM-001">KAN-TOM-001</option>
                    <option value="VEL-ONI-002">VEL-ONI-002</option>
                    <option value="CHE-POT-003">CHE-POT-003</option>
                  </select>
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Reason
                  </label>
                  <select
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Threshold reached">Threshold reached</option>
                    <option value="Max window expired">
                      Max window expired
                    </option>
                    <option value="Manual override">Manual override</option>
                  </select>
                </div>

                {/* Warning callout */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start mt-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-sans text-[10px] text-amber-700 leading-normal">
                    This immediately closes the pool and triggers buyer auction
                    calls.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleForceClose}
              disabled={loadingClose}
              className="bg-soil-brown text-white w-full rounded-lg py-2.5 mt-5 font-sans font-semibold text-xs hover:brightness-110 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loadingClose ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              {loadingClose ? "Closing..." : "Close Pool Now"}
            </button>
          </div>

          {/* PANEL 4: Send Farmer Callbacks */}
          <div className="bg-white rounded-xl border border-gray-200 border-l-2 border-l-field-green p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-field-green shrink-0" />
                <h3 className="font-display font-semibold text-sm text-charcoal">
                  Send Farmer Callbacks
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Pool
                  </label>
                  <select
                    value={callbackPool}
                    onChange={(e) => setCallbackPool(e.target.value)}
                    className={inputClass}
                  >
                    <option value="KAN-TOM-001">KAN-TOM-001</option>
                    <option value="VEL-ONI-002">VEL-ONI-002</option>
                    <option value="CHE-POT-003">CHE-POT-003</option>
                  </select>
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Message Preview
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 font-mono text-[10px] text-gray-500 leading-relaxed whitespace-pre-wrap select-all">
                    Mandi Mitra: Your lot sold at Rs.15/kg (25% above market).
                    Buyer: Ramesh Traders. Pickup: Tomorrow 6AM.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSendCallbacks}
              disabled={loadingCallbacks}
              className="bg-field-green text-white w-full rounded-lg py-2.5 mt-5 font-sans font-semibold text-xs hover:brightness-110 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loadingCallbacks ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
              {loadingCallbacks ? "Sending..." : "Send Callbacks"}
            </button>
          </div>
        </div>

        {/* LIVE EVENT LOG */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col min-h-[220px]">
          <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Demo Event Log
            </span>
            <button
              onClick={handleResetAll}
              className="font-sans text-xs text-gray-400 hover:text-gray-600 transition-colors font-semibold"
            >
              Clear
            </button>
          </div>

          {demoEvents.length > 0 ? (
            <div className="overflow-y-auto max-h-[200px] divide-y divide-gray-100 pr-1">
              {demoEvents.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 py-2.5 last:pb-0 first:pt-0">
                  <span className="font-mono text-xs text-gray-400 w-10 shrink-0">
                    {event.time}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getDotColorClass(
                      event.type
                    )}`}
                  />
                  <span className="font-sans text-xs text-gray-600 leading-normal">
                    {event.message}
                  </span>
                  {event.lang && (
                    <div className="ml-auto shrink-0">
                      <LanguageBadge code={event.lang} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center py-8">
              <span className="font-sans text-xs text-gray-300">
                No events triggered yet. Use the panels above to simulate the demo flow.
              </span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
