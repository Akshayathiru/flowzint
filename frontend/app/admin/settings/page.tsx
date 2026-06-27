"use client";

// TODO: PATCH /api/admin/settings

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";

interface CatchmentZone {
  id: string;
  name: string;
  lat: string;
  lng: string;
  radius: string;
}

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // Pool Threshold values
  const [maxWindow, setMaxWindow] = useState("90");
  const [geoRadius, setGeoRadius] = useState("20");
  const [minLotTomatoes, setMinLotTomatoes] = useState("250");
  const [minLotOnions, setMinLotOnions] = useState("300");
  const [minLotDefault, setMinLotDefault] = useState("150");

  // API Config credentials & Visibility toggles
  const [sarvamKey, setSarvamKey] = useState("");
  const [showSarvamKey, setShowSarvamKey] = useState(false);
  const [bulbulEndpoint, setBulbulEndpoint] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [showApiSecret, setShowApiSecret] = useState(false);

  // Mandi Catchment Zones (TODO: PATCH /api/admin/catchments)
  const [zones, setZones] = useState<CatchmentZone[]>([
    {
      id: "z1",
      name: "Kanchipuram Central",
      lat: "12.8342",
      lng: "79.7036",
      radius: "18",
    },
    {
      id: "z2",
      name: "Vellore Mandi",
      lat: "12.9165",
      lng: "79.1325",
      radius: "20",
    },
    {
      id: "z3",
      name: "Salem North",
      lat: "11.6643",
      lng: "78.1460",
      radius: "15",
    },
  ]);

  // Trust score weights
  const [weightDeliveries, setWeightDeliveries] = useState(60);
  const [weightNoShow, setWeightNoShow] = useState(30);
  const [weightCallback, setWeightCallback] = useState(10);

  const trustSum =
    (Number(weightDeliveries) || 0) +
    (Number(weightNoShow) || 0) +
    (Number(weightCallback) || 0);

  const handleAddZone = () => {
    const nextId = "zone_" + Date.now();
    setZones((prev) => [
      ...prev,
      { id: nextId, name: "", lat: "", lng: "", radius: "" },
    ]);
  };

  const handleDeleteZone = (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
  };

  const handleZoneChange = (
    id: string,
    field: keyof CatchmentZone,
    val: string
  ) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: val } : z))
    );
  };

  const handleSaveChanges = () => {
    if (trustSum !== 100) {
      toast.error("Trust score weights must sum to 100%");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved");
    }, 600);
  };

  const handleResetDemoData = () => {
    // TODO: POST /api/demo/reset
    toast.success("Demo data has been reset to defaults");
  };

  const handleFlushTrust = () => {
    toast.success("All farmer trust scores set to 3.0");
  };

  const inputClass =
    "border border-gray-200 rounded-lg px-3 py-1.5 font-sans text-sm text-right focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal";
  const apiInputClass =
    "border border-gray-200 rounded-lg px-3 py-1.5 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal";

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      {/* PAGE HEADER */}
      <PageHeader
        title="Settings"
        subtitle="System configuration"
        actions={
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-charcoal text-white rounded-lg px-4 py-2 font-sans text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Changes
          </button>
        }
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        <div className="lg:hidden bg-charcoal rounded-xl p-4 mb-2 flex items-center justify-between shadow-sm">
          <div>
            <div className="font-display font-semibold text-sm text-white">Demo Control Panel</div>
            <div className="font-sans text-xs text-gray-400 mt-0.5">Trigger live demo events</div>
          </div>
          <Link href="/demo" className="bg-harvest-gold text-soil-brown rounded-lg px-3 py-2 font-sans text-xs font-medium">
            Open →
          </Link>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
          {/* LEFT Panels */}
          <div className="flex flex-col gap-5">
            {/* SECTION 1: Pool Thresholds */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
              <h2 className="font-display font-semibold text-sm text-charcoal mb-0.5">
                Pool Thresholds
              </h2>
              <p className="font-sans text-xs text-gray-400 mb-4">
                Controls when a pool closes and triggers the buyer auction
              </p>

              <div className="flex flex-col divide-y divide-gray-100">
                {/* Max Pool Window */}
                <div className="flex justify-between items-center py-3">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Max Pool Window
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Hard close after this many minutes regardless of threshold
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={maxWindow}
                      onChange={(e) => setMaxWindow(e.target.value)}
                      className={`${inputClass} w-20`}
                    />
                    <span className="font-sans text-xs text-gray-400 font-medium">
                      min
                    </span>
                  </div>
                </div>

                {/* Geo Radius */}
                <div className="flex justify-between items-center py-3">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Geo Radius
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Max distance between farmers in the same pool
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={geoRadius}
                      onChange={(e) => setGeoRadius(e.target.value)}
                      className={`${inputClass} w-20`}
                    />
                    <span className="font-sans text-xs text-gray-400 font-medium">
                      km
                    </span>
                  </div>
                </div>

                {/* Min Lot Tomatoes */}
                <div className="flex justify-between items-center py-3">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Min Viable Lot &mdash; Tomatoes
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Pool closes early when this quantity is reached
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={minLotTomatoes}
                      onChange={(e) => setMinLotTomatoes(e.target.value)}
                      className={`${inputClass} w-24`}
                    />
                    <span className="font-sans text-xs text-gray-400 font-medium">
                      kg
                    </span>
                  </div>
                </div>

                {/* Min Lot Onions */}
                <div className="flex justify-between items-center py-3">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Min Viable Lot &mdash; Onions
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Pool closes early when this quantity is reached
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={minLotOnions}
                      onChange={(e) => setMinLotOnions(e.target.value)}
                      className={`${inputClass} w-24`}
                    />
                    <span className="font-sans text-xs text-gray-400 font-medium">
                      kg
                    </span>
                  </div>
                </div>

                {/* Min Lot Default */}
                <div className="flex justify-between items-center py-3">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Min Viable Lot &mdash; Default
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Threshold for all other agricultural crops
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={minLotDefault}
                      onChange={(e) => setMinLotDefault(e.target.value)}
                      className={`${inputClass} w-24`}
                    />
                    <span className="font-sans text-xs text-gray-400 font-medium">
                      kg
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: API Configuration */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
              <h2 className="font-display font-semibold text-sm text-charcoal mb-0.5">
                API Configuration
              </h2>
              <p className="font-sans text-xs text-gray-400 mb-4">
                Sarvam AI and Bulbul v3 credentials
              </p>

              {/* Warning Alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="font-sans text-xs text-amber-700 leading-normal">
                  API keys are stored server-side only and never exposed to the browser. Set them in your .env file.
                </span>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {/* Sarvam Key */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3.5 gap-2 sm:gap-0">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Sarvam API Key
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Used for STT and NLU on inbound farmer calls
                    </span>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <input
                      type={showSarvamKey ? "text" : "password"}
                      value={sarvamKey}
                      onChange={(e) => setSarvamKey(e.target.value)}
                      placeholder="sk-sarvam-••••••••"
                      className={`${apiInputClass} w-full pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSarvamKey(!showSarvamKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 hover:text-charcoal focus:outline-none"
                    >
                      {showSarvamKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bulbul Endpoint */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3.5 gap-2 sm:gap-0">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Bulbul Endpoint
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Base URL for outbound TTS call orchestration
                    </span>
                  </div>
                  <input
                    type="text"
                    value={bulbulEndpoint}
                    onChange={(e) => setBulbulEndpoint(e.target.value)}
                    placeholder="https://api.bulbul.ai/v3"
                    className={`${apiInputClass} w-full sm:w-64`}
                  />
                </div>

                {/* Webhook Base URL */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3.5 gap-2 sm:gap-0">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Webhook Base URL
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Your backend receives Sarvam callbacks here
                    </span>
                  </div>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-backend.com/webhooks"
                    className={`${apiInputClass} w-full sm:w-64`}
                  />
                </div>

                {/* Internal Secret */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3.5 gap-2 sm:gap-0">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Internal API Secret
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Shared secret between Next.js API routes and FastAPI backend
                    </span>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <input
                      type={showApiSecret ? "text" : "password"}
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="••••••••••••••••"
                      className={`${apiInputClass} w-full pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 hover:text-charcoal focus:outline-none"
                    >
                      {showApiSecret ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: Mandi Catchment Editor */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
              <h2 className="font-display font-semibold text-sm text-charcoal mb-0.5">
                Mandi Catchment Zones
              </h2>
              <p className="font-sans text-xs text-gray-400 mb-4">
                Define the geo-boundary zones used for farmer pooling
              </p>

              <div className="flex flex-col gap-3.5">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_90px_32px] gap-3 items-center"
                  >
                    {/* Zone name */}
                    <input
                      type="text"
                      value={zone.name}
                      placeholder="Zone Name"
                      onChange={(e) =>
                        handleZoneChange(zone.id, "name", e.target.value)
                      }
                      className="border border-gray-200 rounded px-2.5 py-1.5 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 w-full"
                    />

                    {/* Lat */}
                    <input
                      type="number"
                      value={zone.lat}
                      placeholder="Lat"
                      onChange={(e) =>
                        handleZoneChange(zone.id, "lat", e.target.value)
                      }
                      className="border border-gray-200 rounded px-2.5 py-1.5 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 w-full text-center"
                    />

                    {/* Lng */}
                    <input
                      type="number"
                      value={zone.lng}
                      placeholder="Lng"
                      onChange={(e) =>
                        handleZoneChange(zone.id, "lng", e.target.value)
                      }
                      className="border border-gray-200 rounded px-2.5 py-1.5 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 w-full text-center"
                    />

                    {/* Radius */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={zone.radius}
                        placeholder="Radius"
                        onChange={(e) =>
                          handleZoneChange(zone.id, "radius", e.target.value)
                        }
                        className="border border-gray-200 rounded px-2.5 py-1.5 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 w-full text-center"
                      />
                      <span className="font-sans text-[10px] text-gray-400">km</span>
                    </div>

                    {/* Delete */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(zone.id)}
                        className="text-gray-400 hover:text-alert-red transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Zone Trigger */}
              {/* TODO: PATCH /api/admin/catchments */}
              <button
                onClick={handleAddZone}
                className="border border-dashed border-gray-300 rounded-lg py-2.5 mt-4 w-full text-center font-sans text-xs text-gray-450 hover:bg-gray-50 bg-white transition-colors cursor-pointer select-none"
              >
                + Add Zone
              </button>
            </section>

            {/* SECTION 4: Trust Score Weights */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
              <h2 className="font-display font-semibold text-sm text-charcoal mb-0.5">
                Trust Score Weights
              </h2>
              <p className="font-sans text-xs text-gray-400 mb-4">
                How each factor contributes to a farmer's trust score (must sum to 100)
              </p>

              <div className="flex flex-col divide-y divide-gray-100">
                {/* Confirmed Deliveries */}
                <div className="flex justify-between items-center py-3">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Confirmed Deliveries
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Weight allocation for successfully fulfilled crop drops
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={weightDeliveries}
                      onChange={(e) =>
                        setWeightDeliveries(Number(e.target.value) || 0)
                      }
                      className={`${inputClass} w-20`}
                    />
                    <span className="font-sans text-xs text-gray-400 font-medium">
                      %
                    </span>
                  </div>
                </div>

                {/* No-Shows */}
                <div className="flex justify-between items-center py-3">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      No-Show Penalty
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Penalty weight deduction for missed bookings (inverted)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={weightNoShow}
                      onChange={(e) =>
                        setWeightNoShow(Number(e.target.value) || 0)
                      }
                      className={`${inputClass} w-20`}
                    />
                    <span className="font-sans text-xs text-gray-400 font-medium">
                      %
                    </span>
                  </div>
                </div>

                {/* Callback Confirmations */}
                <div className="flex justify-between items-center py-3">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Callback Confirmation
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Weight of call answering and verbal verification callback rates
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={weightCallback}
                      onChange={(e) =>
                        setWeightCallback(Number(e.target.value) || 0)
                      }
                      className={`${inputClass} w-20`}
                    />
                    <span className="font-sans text-xs text-gray-400 font-medium">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation Status Indicator */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-150">
                {trustSum === 100 ? (
                  <div className="flex items-center gap-1.5 text-field-green text-xs font-semibold font-sans">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Total: {trustSum}%
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-alert-red text-xs font-semibold font-sans">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Total: {trustSum}% &mdash; Must sum to 100
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT Sidebar (sticky) */}
          <aside className="lg:sticky lg:top-6 flex flex-col gap-4">
            {/* Card 1: System Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-3">
                System Status
              </span>

              <div className="flex flex-col divide-y divide-gray-100">
                <div className="flex justify-between items-center py-2 first:pt-0">
                  <span className="font-sans text-xs text-stone-600">Sarvam STT</span>
                  <div className="flex items-center gap-1.5 font-sans text-xs text-field-green font-medium">
                    <span className="w-2 h-2 rounded-full bg-field-green animate-pulse" />
                    Connected
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-sans text-xs text-stone-600">Bulbul v3</span>
                  <div className="flex items-center gap-1.5 font-sans text-xs text-field-green font-medium">
                    <span className="w-2 h-2 rounded-full bg-field-green animate-pulse" />
                    Connected
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-sans text-xs text-stone-600">WebSocket</span>
                  <div className="flex items-center gap-1.5 font-sans text-xs text-field-green font-medium">
                    <span className="w-2 h-2 rounded-full bg-field-green animate-pulse" />
                    Live
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 last:pb-0">
                  <span className="font-sans text-xs text-stone-600">FastAPI Backend</span>
                  <div className="flex items-center gap-1.5 font-sans text-xs text-amber-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Simulated
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Documentation Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-3">
                Documentation
              </span>

              <div className="flex flex-col divide-y divide-gray-100">
                {[
                  "Sarvam AI Docs",
                  "Bulbul v3 API Reference",
                  "Mandi Mitra Backend Repo",
                  "Frontend Spec (this build)",
                ].map((doc) => (
                  <a
                    key={doc}
                    href="#"
                    className="flex items-center gap-2 py-2 first:pt-0 last:pb-0 text-xs text-sky-blue hover:underline font-sans font-medium"
                  >
                    <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                    {doc}
                  </a>
                ))}
              </div>
            </div>

            {/* Card 3: Danger Zone */}
            <div className="bg-white rounded-xl border border-alert-red/20 p-4 shadow-sm hover:border-alert-red/30 transition-colors">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-alert-red block mb-3">
                Danger Zone
              </span>

              <div className="flex flex-col divide-y divide-gray-100">
                {/* Reset simulated data */}
                <div className="flex justify-between items-center py-2 first:pt-0">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Reset Demo Data
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Clears all simulated pools and events
                    </span>
                  </div>
                  <button
                    onClick={handleResetDemoData}
                    className="border border-gray-200 rounded px-2.5 py-1.5 font-sans text-[10px] font-bold text-gray-600 hover:bg-gray-50 bg-white transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                {/* Flush trust */}
                <div className="flex justify-between items-center py-2 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-charcoal">
                      Flush Trust Scores
                    </span>
                    <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                      Sets all farmer trust scores to 3.0
                    </span>
                  </div>
                  <button
                    onClick={handleFlushTrust}
                    className="border border-alert-red/30 text-alert-red rounded px-2.5 py-1.5 font-sans text-[10px] font-bold hover:bg-red-50 bg-white transition-colors cursor-pointer"
                  >
                    Flush
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
