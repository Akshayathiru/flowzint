import React from "react";
import { Skeleton } from "./Skeleton";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export default function TableSkeleton({
  rows = 8,
  cols = 6,
}: TableSkeletonProps) {
  const rowArray = Array.from({ length: rows });
  const colArray = Array.from({ length: cols });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4 flex flex-col gap-4">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        {colArray.map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            className="h-3.5"
            style={{ width: `${80 + (i % 3) * 20}px` }}
          />
        ))}
      </div>

      {/* Data Rows */}
      <div className="flex flex-col gap-3.5">
        {rowArray.map((_, rIdx) => (
          <div
            key={`row-${rIdx}`}
            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
          >
            {colArray.map((_, cIdx) => {
              // Vary the skeleton widths for realistic look
              const baseWidth = 60 + ((rIdx + cIdx) % 4) * 20;
              return (
                <Skeleton
                  key={`cell-${rIdx}-${cIdx}`}
                  className="h-3"
                  style={{ width: `${baseWidth}px` }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
