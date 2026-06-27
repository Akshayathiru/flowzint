"use client";

import React, { useState } from "react";
import { Link } from "@/lib/navigation";
import BuyerCallHistoryModal from "@/components/buyers/BuyerCallHistoryModal";
import { useAuth } from "@/hooks/useAuth";

interface CropLot {
  name: string;
  minQtyKg: number;
}

interface LastWin {
  price: number;
  crop: string;
  daysAgo: number;
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  districts: string[];
  crops: CropLot[];
  lastWin: LastWin | null;
  active: boolean;
  totalAuctions: number;
}

interface BuyerCardProps {
  buyer: Buyer;
  onToggleActive: (id: string) => void;
}

export default function BuyerCard({ buyer, onToggleActive }: BuyerCardProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const { isViewer } = useAuth();

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-all ${
        !buyer.active ? "opacity-60" : ""
      }`}
    >
      {/* Top Row */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display font-semibold text-base text-charcoal">
            {buyer.name}
          </h3>
          <p className="font-mono text-xs text-gray-500 mt-0.5">
            {buyer.phone}
          </p>
        </div>
        <div>
          {buyer.active ? (
            <span className="bg-field-green/10 text-field-green text-[10px] font-semibold rounded-full px-2.5 py-0.5 font-sans">
              Active
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full px-2.5 py-0.5 font-sans">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Middle Row */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-50 pt-4">
        {/* Col 1: Districts */}
        <div>
          <span className="font-sans text-[10px] uppercase tracking-wider text-gray-500 font-bold block">
            Districts
          </span>
          <p className="font-sans text-xs text-charcoal mt-1.5 font-medium leading-relaxed">
            {buyer.districts.join(" · ")}
          </p>
        </div>

        {/* Col 2: Crops & Min Lot */}
        <div>
          <span className="font-sans text-[10px] uppercase tracking-wider text-gray-500 font-bold block">
            Crops &amp; Min Lot
          </span>
          <div className="font-sans text-xs text-charcoal mt-1.5 font-medium flex flex-col gap-1">
            {buyer.crops.map((c, idx) => (
              <span key={idx}>
                {c.name} &ge; {c.minQtyKg}kg
              </span>
            ))}
          </div>
        </div>

        {/* Col 3: Last Win */}
        <div>
          <span className="font-sans text-[10px] uppercase tracking-wider text-gray-500 font-bold block">
            Last Auction Win
          </span>
          {buyer.lastWin ? (
            <p className="font-display font-semibold text-sm text-field-green mt-1.5">
              ₹{buyer.lastWin.price}/kg &middot; {buyer.lastWin.daysAgo}d ago
            </p>
          ) : (
            <p className="font-sans text-xs text-gray-500 mt-1.5">
              No wins yet
            </p>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center border-t border-gray-100 pt-3">
        <span className="font-sans text-xs text-gray-500">
          {buyer.totalAuctions} auctions participated
        </span>
        <div className="flex gap-2 items-center justify-end">
          <button
            onClick={() => setHistoryOpen(true)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-600 hover:bg-gray-50 bg-white transition-colors cursor-pointer"
          >
            Call History
          </button>
          {!isViewer && (
            <>
              <Link
                href={`/buyers/register?edit=${buyer.id}`}
                className="border border-gray-200 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-655 hover:bg-gray-50 bg-white transition-colors text-center cursor-pointer"
              >
                Edit
              </Link>
              <button
                onClick={() => onToggleActive(buyer.id)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold text-gray-500 hover:bg-gray-50 bg-white transition-colors cursor-pointer"
              >
                {buyer.active ? "Deactivate" : "Activate"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Buyer Call History modal overlay */}
      <BuyerCallHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        buyerName={buyer.name}
        buyerId={buyer.id}
      />
    </div>
  );
}
