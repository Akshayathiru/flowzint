import React from "react";

interface TrustBadgeProps {
  score: number;
}

export default function TrustBadge({ score }: TrustBadgeProps) {
  const getStyleClass = () => {
    if (score >= 3.5) {
      return "text-field-green bg-field-green/10";
    } else if (score >= 2) {
      return "text-amber-600 bg-amber-50";
    } else {
      return "text-alert-red bg-red-50";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold font-sans tracking-wide ${getStyleClass()}`}
    >
      ★ {score.toFixed(1)}
    </span>
  );
}
