import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { ActivePool } from "@/types";
import { useTranslations } from "next-intl";

interface PoolCardProps {
  poolId: string;
  crop: string;
  location: string;
  currentQtyKg: number;
  targetQtyKg: number;
  farmersCount: number;
  minutesRemaining: number;
  status: ActivePool["status"];
}

export default function PoolCard({
  poolId,
  crop,
  location,
  currentQtyKg,
  targetQtyKg,
  farmersCount,
  minutesRemaining,
  status,
}: PoolCardProps) {
  const t = useTranslations("pool");
  const percentage = Math.min(Math.round((currentQtyKg / targetQtyKg) * 100), 100);

  const getBarColorClass = () => {
    switch (status) {
      case "filling":
        return "bg-sky-blue";
      case "auctioning":
        return "bg-harvest-gold";
      case "settled":
        return "bg-field-green";
      default:
        return "bg-gray-400";
    }
  };

  const getBorderColorClass = () => {
    switch (status) {
      case "auctioning":
        return "border-l-2 border-l-harvest-gold";
      case "settled":
        return "border-l-2 border-l-field-green";
      default:
        return "";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-3 lg:p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-150 ${getBorderColorClass()}`}
    >
      {/* Top Row */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display font-semibold text-base text-charcoal">
            {crop}
          </h3>
          <p className="font-sans text-xs text-gray-500">{location}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Progress Bar Row */}
      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-gray-500 font-sans mb-1.5">
          <span>{currentQtyKg}kg pooled</span>
          <span>Target: {targetQtyKg}kg</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentQtyKg}
          aria-valuemin={0}
          aria-valuemax={targetQtyKg}
          aria-label={t("farmers_pooled")}
          className="w-full h-2 rounded-full bg-gray-100 overflow-hidden"
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ${getBarColorClass()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4 items-center text-xs text-gray-500 font-sans">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span>{farmersCount} farmers pooled</span>
        </div>
        <div>
          <span>⏱ {minutesRemaining} min remaining</span>
        </div>
        <Link
          href={`/dashboard/pool/${poolId}`}
          className="text-sky-blue font-sans text-xs font-medium hover:underline w-full lg:w-auto mt-1 lg:mt-0"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
