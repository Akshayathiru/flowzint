import React from "react";
import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";
import TrustBadge from "@/components/shared/TrustBadge";
import LanguageBadge from "@/components/shared/LanguageBadge";

interface FarmerRow {
  phone: string;
  qty: number;
  lang: string;
  trust: number;
  status: "confirmed" | "pending";
}

const demoFarmers: FarmerRow[] = [
  { phone: "+91 98XXX 10001", qty: 200, lang: "ta", trust: 4.2, status: "confirmed" },
  { phone: "+91 97XXX 10002", qty: 150, lang: "te", trust: 3.8, status: "confirmed" },
  { phone: "+91 96XXX 10003", qty: 180, lang: "hi", trust: 4.5, status: "pending" },
  { phone: "+91 95XXX 10004", qty: 220, lang: "ta", trust: 2.9, status: "confirmed" },
  { phone: "+91 94XXX 10005", qty: 130, lang: "kn", trust: 3.1, status: "pending" },
  { phone: "+91 93XXX 10006", qty: 140, lang: "te", trust: 4.0, status: "confirmed" },
];

export default function FarmerTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Farmers in This Pool
        </span>
        <span className="font-sans text-xs text-gray-400">
          6 farmers &middot; 1,020 kg total
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                Phone
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
                Callback Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {demoFarmers.map((farmer, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                {/* Phone */}
                <td className="py-3 font-mono text-xs text-charcoal font-medium">
                  <Link
                    href={`/farmers/${encodeURIComponent(farmer.phone)}`}
                    className="text-sky-blue hover:underline"
                  >
                    {farmer.phone}
                  </Link>
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
                  <TrustBadge score={farmer.trust} />
                </td>

                {/* Callback Status */}
                <td className="py-3">
                  {farmer.status === "confirmed" ? (
                    <div className="flex items-center gap-1 text-field-green">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold">Called</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-semibold">Pending</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
