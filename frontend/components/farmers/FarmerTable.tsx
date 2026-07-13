"use client";

import React from "react";
import Link from "next/link";
import LanguageBadge from "@/components/shared/LanguageBadge";

export interface PoolFarmerRow {
  phone: string;
  quantity_kg: number;
  trust_score: number;
  call_time: string;
  language: string;
}

interface FarmerTableProps {
  farmers: PoolFarmerRow[];
}

export default function FarmerTable({ farmers }: FarmerTableProps) {
  const totalQtyKg = farmers.reduce((sum, f) => sum + f.quantity_kg, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Farmers in This Pool
        </span>
        <span className="font-sans text-xs text-gray-500 font-semibold">
          {farmers.length} farmers &middot; {totalQtyKg.toLocaleString()} kg total
        </span>
      </div>

      {farmers.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400 font-semibold">
          No farmers in this pool yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <caption className="sr-only">Farmers pooled in the current auction lot</caption>
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                  Phone
                </th>
                <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                  Quantity
                </th>
                <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                  Language
                </th>
                <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                  Trust Score
                </th>
                <th scope="col" className="pb-3 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                  Call Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {farmers.map((farmer, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 font-sans text-xs text-charcoal font-medium">
                    <Link
                      href={`/farmers/${encodeURIComponent(farmer.phone)}`}
                      className="text-sky-blue hover:underline font-semibold"
                    >
                      {farmer.phone}
                    </Link>
                  </td>
                  <td className="py-3 text-charcoal">
                    <span className="font-display font-semibold text-xs text-charcoal">
                      {farmer.quantity_kg}
                    </span>{" "}
                    <span className="text-gray-500">kg</span>
                  </td>
                  <td className="py-3">
                    <LanguageBadge code={farmer.language} />
                  </td>
                  <td className="py-3 font-sans text-xs text-charcoal font-semibold">
                    {farmer.trust_score.toFixed(1)}
                  </td>
                  <td className="py-3 text-gray-500 font-mono text-[11px]">
                    {new Date(farmer.call_time).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
