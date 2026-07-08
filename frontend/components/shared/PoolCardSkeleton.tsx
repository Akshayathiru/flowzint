import React from "react";
import { Skeleton } from "./Skeleton";

export default function PoolCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4">
      {/* Top Header Row */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5 w-1/3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      {/* Progress Bar Container */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mt-2 border-t border-gray-50 pt-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>

      {/* Bottom Button Actions */}
      <div className="flex justify-end gap-2 mt-2 border-t border-gray-50 pt-3">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}
