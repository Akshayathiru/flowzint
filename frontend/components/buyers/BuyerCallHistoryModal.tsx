"use client";

// TODO: replace hardcoded entries with useQuery('/api/buyers/{buyerId}/calls')

import React from "react";
import { Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BuyerCallHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerName: string;
  buyerId: string;
}

interface CallHistoryEntry {
  poolId: string;
  date: string;
  crop: string;
  district: string;
  bid: number | null;
  result: "won" | "lost" | "no_answer" | "pending";
  lotQtyKg: number;
}

export default function BuyerCallHistoryModal({
  isOpen,
  onClose,
  buyerName,
  buyerId,
}: BuyerCallHistoryModalProps) {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const [history, setHistory] = React.useState<CallHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      fetch(`${baseUrl}/buyers/${buyerId}/call-history`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setHistory(data);
          } else {
            throw new Error("Invalid data format");
          }
        })
        .catch((err) => {
          console.error("Failed to load call history:", err);
          setError("Failed to load call history. Please try again.");
        })
        .finally(() => setIsLoading(false));

      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen, buyerId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-labelledby="buyer-modal-title" className="max-w-lg">
        <DialogHeader>
          <DialogTitle id="buyer-modal-title" className="font-display font-semibold text-base text-charcoal">
            {buyerName} &mdash; Auction Call History
          </DialogTitle>
        </DialogHeader>

        {/* Dialog Body */}
        <div className="my-4 max-h-[320px] overflow-y-auto pr-1 flex flex-col gap-1">
          {error ? (
            <div className="text-center py-8 font-sans text-xs text-red-500 font-medium">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 font-sans text-xs gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              <span>Loading call history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 font-sans text-xs text-gray-500">
              No calls recorded for this buyer.
            </div>
          ) : (
            history.map((entry, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0"
              >
                {/* Left Details */}
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-gray-500 font-bold">
                    {entry.poolId}
                  </span>
                  <span className="font-sans text-xs text-charcoal mt-0.5 font-medium">
                    {entry.crop} &middot; {entry.district} ({entry.lotQtyKg}kg)
                  </span>
                  <span className="font-sans text-[10px] text-gray-500 mt-0.5">
                    {entry.date}
                  </span>
                </div>

                {/* Right Result Actions */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                  {entry.result === "won" && (
                    <>
                      <span className="font-display font-bold text-sm text-field-green">
                        ₹{entry.bid}/kg
                      </span>
                      <span className="bg-field-green/10 text-field-green text-[9px] font-bold rounded px-2 py-0.5 font-sans uppercase">
                        Won
                      </span>
                    </>
                  )}

                  {entry.result === "lost" && (
                    <>
                      <span className="font-display font-medium text-xs text-gray-500">
                        ₹{entry.bid}/kg
                      </span>
                      <span className="bg-gray-100 text-gray-455 text-[9px] font-bold rounded px-2 py-0.5 font-sans uppercase">
                        Outbid
                      </span>
                    </>
                  )}

                  {entry.result === "no_answer" && (
                    <div className="flex items-center gap-1 text-amber-500 font-sans text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>No Answer / No-Show</span>
                    </div>
                  )}

                  {entry.result === "pending" && (
                    <div className="bg-blue-50 text-blue-600 text-[9px] font-bold rounded px-2 py-0.5 font-sans uppercase">
                      Pending Deal
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>


        {/* Dialog Footer */}
        <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="border border-gray-200 rounded-lg px-4 py-2 font-sans text-xs font-semibold text-gray-500 hover:bg-gray-50 bg-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
