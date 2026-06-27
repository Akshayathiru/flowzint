"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  PhoneMissed,
} from "lucide-react";
import TrustBadge from "@/components/shared/TrustBadge";
import LanguageBadge from "@/components/shared/LanguageBadge";

interface FarmerRow {
  phone: string;
  qty: number;
  lang: string;
  trust: number;
  confidence: number;
  farmerResponse: "yes" | "no" | "no_answer" | "pending";
  isFirstCall?: boolean;
  totalCalls: number;
}

const demoFarmers: FarmerRow[] = [
  {
    phone: "+91 98XXX 10001",
    qty: 200,
    lang: "ta",
    trust: 4.2,
    confidence: 0.95,
    farmerResponse: "yes",
    totalCalls: 12,
  },
  {
    phone: "+91 97XXX 10002",
    qty: 150,
    lang: "te",
    trust: 3.8,
    confidence: 0.72,
    farmerResponse: "pending",
    totalCalls: 9,
  },
  {
    phone: "+91 96XXX 10003",
    qty: 180,
    lang: "hi",
    trust: 4.5,
    confidence: 0.88,
    farmerResponse: "yes",
    totalCalls: 21,
  },
  {
    phone: "+91 95XXX 10004",
    qty: 220,
    lang: "ta",
    trust: 2.9,
    confidence: 0.61,
    farmerResponse: "no",
    totalCalls: 6,
  },
  {
    phone: "+91 94XXX 10005",
    qty: 130,
    lang: "kn",
    trust: 3.1,
    confidence: 0.91,
    farmerResponse: "no_answer",
    isFirstCall: true,
    totalCalls: 1,
  },
  {
    phone: "+91 93XXX 10006",
    qty: 140,
    lang: "te",
    trust: 4.0,
    confidence: 0.83,
    farmerResponse: "yes",
    totalCalls: 7,
  },
  {
    phone: "+91 92XXX 10007",
    qty: 110,
    lang: "hi",
    trust: 3.5,
    confidence: 0.97,
    farmerResponse: "yes",
    totalCalls: 31,
  },
  {
    phone: "+91 91XXX 10008",
    qty: 90,
    lang: "ta",
    trust: 4.1,
    confidence: 0.78,
    farmerResponse: "pending",
    isFirstCall: true,
    totalCalls: 1,
  },
];

export default function FarmerTable() {
  const activeFarmers = demoFarmers.filter((f) => f.farmerResponse !== "no");
  const totalQtyKg = activeFarmers.reduce((sum, f) => sum + f.qty, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Farmers in This Pool
        </span>
        <span className="font-sans text-xs text-gray-400 font-semibold">
          {demoFarmers.length} farmers &middot; {totalQtyKg} kg total
        </span>
      </div>

      {/* Warning Banner if any farmer declined */}
      {demoFarmers.some((f) => f.farmerResponse === "no") && (
        <div className="bg-alert-red/5 border border-alert-red/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <XCircle className="w-3.5 h-3.5 text-alert-red shrink-0" />
          <span className="font-sans text-xs text-alert-red font-medium">
            1 farmer declined the offer. Their quantity (220kg) has been removed from the settlement total.
          </span>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                Phone
              </th>
              <th className="pb-3 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                STT Confidence
              </th>
              <th className="pb-3 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                Quantity
              </th>
              <th className="pb-3 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                Language
              </th>
              <th className="pb-3 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                Trust Score
              </th>
              <th className="pb-3 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                Total Calls
              </th>
              <th className="pb-3 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                Callback Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {demoFarmers.map((farmer, index) => {
              const isDeclined = farmer.farmerResponse === "no";
              return (
                <tr
                  key={index}
                  className={`transition-colors ${
                    isDeclined
                      ? "bg-red-50/70 hover:bg-red-100/50"
                      : "hover:bg-gray-50/50"
                  }`}
                >
                  {/* Phone */}
                  <td className="py-3 font-mono text-xs text-charcoal font-medium">
                    <Link
                      href={`/farmers/${encodeURIComponent(farmer.phone)}`}
                      className="text-sky-blue hover:underline"
                    >
                      {farmer.phone}
                    </Link>
                  </td>

                  {/* STT Confidence */}
                  <td className="py-3">
                    {farmer.confidence >= 0.8 ? (
                      <span className="font-sans text-xs text-gray-400">
                        {(farmer.confidence * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-amber-50 border border-amber-200 rounded px-2 py-0.5 text-[10px] text-amber-700 font-semibold select-none">
                        <AlertTriangle className="w-2.5 h-2.5 inline mr-1 shrink-0" />
                        {(farmer.confidence * 100).toFixed(0)}% &mdash; Verify
                      </span>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 text-charcoal">
                    <span className="font-display font-semibold text-xs text-charcoal">
                      {farmer.qty}
                    </span>{" "}
                    <span className="text-gray-400">kg</span>
                  </td>

                  {/* Language */}
                  <td className="py-3">
                    <LanguageBadge code={farmer.lang} />
                  </td>

                  {/* Trust Score */}
                  <td className="py-3">
                    {farmer.isFirstCall ? (
                      <span
                        style={{
                          background: "var(--bg-accent)",
                          color: "var(--text-accent)",
                        }}
                        className="rounded px-2 py-0.5 text-[10px] font-medium font-sans"
                      >
                        New caller
                      </span>
                    ) : (
                      <TrustBadge score={farmer.trust} />
                    )}
                  </td>

                  {/* Total Calls */}
                  <td className="py-3 text-gray-500 font-medium">
                    {farmer.isFirstCall ? (
                      <span className="font-sans text-xs text-gray-400">
                        1st call
                      </span>
                    ) : (
                      farmer.totalCalls
                    )}
                  </td>

                  {/* Callback Status */}
                  <td className="py-3">
                    {farmer.farmerResponse === "yes" && (
                      <div className="flex items-center gap-1.5 text-field-green">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] font-bold">Confirmed</span>
                      </div>
                    )}
                    {farmer.farmerResponse === "no" && (
                      <div className="flex items-center gap-1.5 text-alert-red">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] font-bold">Declined</span>
                      </div>
                    )}
                    {farmer.farmerResponse === "no_answer" && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <PhoneMissed className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-[10px] font-bold">No Answer</span>
                        </div>
                        <div className="font-sans text-[10px] text-gray-400 mt-0.5">
                          Bulbul will retry in 10 min
                        </div>
                      </div>
                    )}
                    {farmer.farmerResponse === "pending" && (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] font-bold">Awaiting</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
