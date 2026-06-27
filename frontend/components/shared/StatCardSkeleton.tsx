import React from "react";
import { Skeleton } from "./Skeleton";

export default function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex items-center gap-4">
      {/* Icon Circle */}
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />

      {/* Text Details */}
      <div className="flex flex-col gap-1.5 flex-1">
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-2 w-28" />
      </div>
    </div>
  );
}
