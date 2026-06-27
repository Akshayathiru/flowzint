"use client";

import React from "react";
import Link from "next/link";
import TrustBadge from "@/components/shared/TrustBadge";

export interface FarmerCallRecord {
  phone: string;
  crop: string;
  lastCall: string;
  lastQty: number;
  trust: number;
  totalCalls: number;
  district: string;
  isFirstCall?: boolean;
}

interface FarmerCallLogTableProps {
  records: FarmerCallRecord[];
  onRowClick: (phone: string) => void;
  sortBy?: string;
}

export default function FarmerCallLogTable({
  records,
  onRowClick,
  sortBy = "recent",
}: FarmerCallLogTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <caption className="sr-only">Farmer call records log including crop and trust score</caption>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 font-sans">
              <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Phone
              </th>
              <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Primary Crop
              </th>
              <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Last Call
              </th>
              <th
                scope="col"
                aria-sort={sortBy === "qty_desc" ? "descending" : "none"}
                className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500"
              >
                Qty (Last)
              </th>
              <th
                scope="col"
                aria-sort={sortBy === "trust_desc" ? "descending" : sortBy === "trust_asc" ? "ascending" : "none"}
                className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500"
              >
                Trust Score
              </th>
              <th
                scope="col"
                aria-sort={sortBy === "calls_desc" ? "descending" : "none"}
                className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center"
              >
                Total Calls
              </th>
              <th scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((farmer, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick(farmer.phone)}
                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                {/* Phone */}
                <td className="px-4 py-3 font-mono text-xs text-charcoal font-medium">
                  <Link
                    href={`/farmers/${encodeURIComponent(farmer.phone)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sky-blue hover:underline"
                  >
                    {farmer.phone}
                  </Link>
                </td>

                {/* Primary Crop */}
                <td className="px-4 py-3 text-charcoal font-medium">
                  {farmer.crop}
                </td>

                {/* Last Call */}
                <td className="px-4 py-3 text-gray-500">
                  {farmer.lastCall}
                </td>

                {/* Qty */}
                <td className="px-4 py-3 text-charcoal">
                  <span className="font-display font-semibold text-xs text-charcoal">
                    {farmer.lastQty}
                  </span>{" "}
                  <span className="text-gray-500">kg</span>
                </td>

                {/* Trust Score */}
                <td className="px-4 py-3">
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
                <td className="px-4 py-3 text-gray-500 text-center font-medium">
                  {farmer.isFirstCall ? (
                    <span className="font-sans text-xs text-gray-500">
                      1st call
                    </span>
                  ) : (
                    farmer.totalCalls
                  )}
                </td>

                {/* Action */}
                <td className="px-4 py-3">
                  <Link
                    href={`/farmers/${encodeURIComponent(farmer.phone)}`}
                    onClick={(e) => e.stopPropagation()} // Prevent row click trigger
                    className="text-xs font-semibold text-sky-blue hover:underline"
                  >
                    View &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
