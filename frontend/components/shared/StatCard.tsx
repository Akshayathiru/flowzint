import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sublabel: string;
  trend?: "up" | "down" | null;
  icon: LucideIcon;
}

export default function StatCard({
  label,
  value,
  sublabel,
  trend,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 lg:p-4 relative shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {label}
          </span>
          <div className="text-soil-brown">
            <Icon className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
          </div>
        </div>
        <div className="font-display font-bold text-2xl lg:text-3xl text-charcoal mt-1">
          {value}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 text-xs">
        {trend === "up" && (
          <span className="flex items-center text-field-green font-semibold gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
          </span>
        )}
        {trend === "down" && (
          <span className="flex items-center text-alert-red font-semibold gap-0.5">
            <TrendingDown className="w-3.5 h-3.5" />
          </span>
        )}
        <span className="text-gray-400 font-sans">{sublabel}</span>
      </div>
    </div>
  );
}
