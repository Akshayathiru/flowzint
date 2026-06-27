import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}
