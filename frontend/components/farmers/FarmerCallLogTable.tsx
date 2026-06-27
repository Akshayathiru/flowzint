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
}

interface FarmerCallLogTableProps {
  records: FarmerCallRecord[];
  onRowClick: (phone: string) => void;
}

export default function FarmerCallLogTable({
  records,
  onRowClick,
}: FarmerCallLogTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 font-sans">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Phone
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Primary Crop
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Last Call
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Qty (Last)
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Trust Score
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                Total Calls
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
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
                <td className="px-4 py-3 text-gray-400">
                  {farmer.lastCall}
                </td>

                {/* Qty */}
                <td className="px-4 py-3 text-charcoal">
                  <span className="font-display font-semibold text-xs text-charcoal">
                    {farmer.lastQty}
                  </span>{" "}
                  <span className="text-gray-400">kg</span>
                </td>

                {/* Trust Score */}
                <td className="px-4 py-3">
                  <TrustBadge score={farmer.trust} />
                </td>

                {/* Total Calls */}
                <td className="px-4 py-3 text-gray-500 text-center font-medium">
                  {farmer.totalCalls}
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
