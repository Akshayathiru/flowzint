"use client";

// TODO: GET /api/admin/settings on mount to load saved values from backend

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface CatchmentZone {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  status: "active" | "inactive";
}

export default function AdminSettingsPage() {
  const { isViewer } = useAuth();

  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Pool Configuration States
  const [minLot, setMinLot] = useState(500);
  const [maxWindow, setMaxWindow] = useState(90);
  const [geoRadius, setGeoRadius] = useState(25);
  const [minBuyers, setMinBuyers] = useState(2);

  // Trust Score Weights States
  const [weightDelivery, setWeightDelivery] = useState(0.4);
  const [weightNoShow, setWeightNoShow] = useState(0.3);
  const [weightCallback, setWeightCallback] = useState(0.2);
  const [weightFrequency, setWeightFrequency] = useState(0.1);

  // API Configuration States
  const [sarvamKey, setSarvamKey] = useState("sk-sarv-••••••••••");
  const [showSarvamKey, setShowSarvamKey] = useState(false);
  const [bulbulEndpoint, setBulbulEndpoint] = useState(
    "https://api.sarvam.ai/bulbul/v3"
  );
  const [webhookUrl, setWebhookUrl] = useState(
    "https://mandimitra.in/webhooks"
  );

  // Mandi Catchment Zones States
  const [zones, setZones] = useState<CatchmentZone[]>([
    {
      name: "Kanchipuram Mandi",
      lat: 12.8342,
      lng: 79.7036,
      radiusKm: 18,
      status: "active",
    },
    {
      name: "Vellore Mandi",
      lat: 12.9165,
      lng: 79.1325,
      radiusKm: 22,
      status: "active",
    },
    {
      name: "Chengalpattu Mandi",
      lat: 12.6819,
      lng: 80.0012,
      radiusKm: 15,
      status: "active",
    },
    {
      name: "Tiruvannamalai Mandi",
      lat: 12.2269,
      lng: 79.0745,
      radiusKm: 30,
      status: "inactive",
    },
  ]);

  // Live Trust weights validation
  const trustWeightSum = Number(
    (
      weightDelivery +
      weightNoShow +
      weightCallback +
      weightFrequency
    ).toFixed(2)
  );
  const isWeightsSumValid = trustWeightSum === 1.0;

  const handleTestConnection = () => {
    setIsTestingApi(true);
    // TODO: POST /api/admin/test-sarvam
    setTimeout(() => {
      setIsTestingApi(false);
      toast.success("Sarvam API: Connected ✓");
    }, 1500);
  };

  const handleAddZone = () => {
    // TODO: modal with map picker for lat/lng and radius slider
    toast.info("Zone editor coming soon");
  };

  const handleToggleZoneStatus = (idx: number) => {
    if (isViewer) return;
    setZones((prev) =>
      prev.map((z, i) =>
        i === idx
          ? { ...z, status: z.status === "active" ? "inactive" : "active" }
          : z
      )
    );
  };

  const handleRemoveZone = (idx: number) => {
    if (isViewer) return;
    setZones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!isWeightsSumValid) {
      toast.error("Trust score weights must sum to 1.0");
      return;
    }
    setIsSaving(true);
    // TODO: POST /api/admin/settings with all form values
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-warm-cream py-8 px-6 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* HEADER */}
        <div className="border-b border-gray-200 pb-5">
          <h1 className="font-semibold text-xl text-charcoal font-display">
            System Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure pool thresholds, API integrations, and mandi catchment zones.
          </p>
        </div>

        {/* SECTION 1: POOL CONFIGURATION */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xs font-bold tracking-wider text-gray-550 uppercase mb-5">
            Pool Configuration
          </h2>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <label htmlFor="min-lot-input" className="text-xs font-semibold text-charcoal block">
                  Minimum viable lot per crop (kg)
                </label>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Pools below this threshold will expire without auction
                </span>
              </div>
              <input
                id="min-lot-input"
                type="number"
                disabled={isViewer}
                value={minLot}
                onChange={(e) => setMinLot(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <label htmlFor="max-window-input" className="text-xs font-semibold text-charcoal block">
                  Maximum pool window (minutes)
                </label>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Pools auto-close after this duration regardless of fill level
                </span>
              </div>
              <input
                id="max-window-input"
                type="number"
                disabled={isViewer}
                value={maxWindow}
                onChange={(e) => setMaxWindow(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <label htmlFor="geo-radius-input" className="text-xs font-semibold text-charcoal block">
                  Default geo-radius (km)
                </label>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Catchment boundary for grouping farmers into the same pool
                </span>
              </div>
              <input
                id="geo-radius-input"
                type="number"
                disabled={isViewer}
                value={geoRadius}
                onChange={(e) => setGeoRadius(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <label htmlFor="min-buyers-input" className="text-xs font-semibold text-charcoal block">
                  Minimum buyers for valid auction
                </label>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  At least this many buyers must be called before accepting a winning bid
                </span>
              </div>
              <input
                id="min-buyers-input"
                type="number"
                disabled={isViewer}
                value={minBuyers}
                onChange={(e) => setMinBuyers(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: TRUST SCORE WEIGHTS */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xs font-bold tracking-wider text-gray-550 uppercase mb-5">
            Trust Score Weights
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="weight-delivery-input" className="text-xs font-semibold text-charcoal">
                Confirmed delivery weight
              </label>
              <input
                id="weight-delivery-input"
                type="number"
                step="0.1"
                min="0"
                max="1"
                disabled={isViewer}
                value={weightDelivery}
                onChange={(e) => setWeightDelivery(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label htmlFor="weight-noshow-input" className="text-xs font-semibold text-charcoal">
                No-show penalty weight
              </label>
              <input
                id="weight-noshow-input"
                type="number"
                step="0.1"
                min="0"
                max="1"
                disabled={isViewer}
                value={weightNoShow}
                onChange={(e) => setWeightNoShow(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label htmlFor="weight-callback-input" className="text-xs font-semibold text-charcoal">
                Callback confirmation weight
              </label>
              <input
                id="weight-callback-input"
                type="number"
                step="0.1"
                min="0"
                max="1"
                disabled={isViewer}
                value={weightCallback}
                onChange={(e) => setWeightCallback(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label htmlFor="weight-frequency-input" className="text-xs font-semibold text-charcoal">
                Call frequency weight
              </label>
              <input
                id="weight-frequency-input"
                type="number"
                step="0.1"
                min="0"
                max="1"
                disabled={isViewer}
                value={weightFrequency}
                onChange={(e) => setWeightFrequency(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal"
              />
            </div>

            {/* Weights summary validation feedback banner */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-500">
                Total weight: {trustWeightSum}
              </span>
              {isWeightsSumValid ? (
                <div className="text-field-green flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Weights sum to 1.0 ✓</span>
                </div>
              ) : (
                <div className="text-alert-red flex items-center gap-1.5 font-bold" role="alert">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Weights must sum to 1.0</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: API CONFIGURATION */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xs font-bold tracking-wider text-gray-550 uppercase mb-5">
            API Integrations
          </h2>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sarvam-key-input" className="text-xs font-semibold text-charcoal block">
                Sarvam API Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="sarvam-key-input"
                    type={showSarvamKey ? "text" : "password"}
                    disabled={isViewer}
                    value={sarvamKey}
                    onChange={(e) => setSarvamKey(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSarvamKey((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    aria-label={showSarvamKey ? "Hide key" : "Show key"}
                  >
                    {showSarvamKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingApi}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-semibold text-gray-655 hover:bg-gray-50 bg-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 select-none"
                >
                  {isTestingApi && <Loader2 size={12} className="animate-spin" />}
                  Test Connection
                </button>
              </div>
              <span className="text-[11px] text-gray-500 block">
                Used for STT and NLU on inbound farmer calls
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="bulbul-endpoint-input" className="text-xs font-semibold text-charcoal block">
                Bulbul TTS Endpoint
              </label>
              <input
                id="bulbul-endpoint-input"
                type="text"
                disabled={isViewer}
                value={bulbulEndpoint}
                onChange={(e) => setBulbulEndpoint(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal font-mono"
              />
              <span className="text-[11px] text-gray-500 block">
                Outbound IVR call synthesis endpoint
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="webhook-url-input" className="text-xs font-semibold text-charcoal block">
                Webhook Base URL
              </label>
              <input
                id="webhook-url-input"
                type="text"
                disabled={isViewer}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-soil-brown/20 focus:border-soil-brown bg-white text-charcoal font-mono"
              />
              <span className="text-[11px] text-gray-500 block">
                Base URL for receiving call status callbacks from telephony provider
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: MANDI CATCHMENT ZONES */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xs font-bold tracking-wider text-gray-550 uppercase mb-5">
            Mandi Catchment Zones
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <caption className="sr-only">List of mandi catchment zones and coordinates</caption>
              <thead>
                <tr className="border-b border-gray-150 font-sans text-gray-505 font-bold uppercase tracking-wider text-[10px]">
                  <th scope="col" className="pb-2">Zone Name</th>
                  <th scope="col" className="pb-2">Center (lat, lng)</th>
                  <th scope="col" className="pb-2">Radius (km)</th>
                  <th scope="col" className="pb-2">Status</th>
                  <th scope="col" className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-105 text-gray-655 font-sans">
                {zones.map((z, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-charcoal">{z.name}</td>
                    <td className="py-3 font-mono">{z.lat.toFixed(4)}, {z.lng.toFixed(4)}</td>
                    <td className="py-3">{z.radiusKm}km</td>
                    <td className="py-3">
                      {z.status === "active" ? (
                        <span className="bg-field-green/10 text-field-green font-bold text-[10px] px-2 py-0.5 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 font-bold text-[10px] px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-3 font-semibold">
                        <button
                          type="button"
                          onClick={() => handleToggleZoneStatus(idx)}
                          className="text-soil-brown hover:underline cursor-pointer"
                        >
                          {z.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveZone(idx)}
                          className="text-alert-red hover:text-red-800 cursor-pointer flex items-center justify-center"
                          aria-label={`Remove ${z.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddZone}
            className="border border-dashed border-gray-300 rounded-lg px-4 py-3 font-sans text-xs font-semibold text-gray-500 hover:border-soil-brown hover:text-soil-brown w-full text-center mt-5 cursor-pointer transition-colors"
          >
            + Add Catchment Zone
          </button>
        </div>

        {/* BOTTOM SAVE CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-200 mt-4 pb-8">
          <p className="text-[11px] text-gray-500 max-w-sm">
            Changes apply to all new pools. Existing pools are not affected.
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-charcoal text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5 select-none disabled:opacity-50"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
