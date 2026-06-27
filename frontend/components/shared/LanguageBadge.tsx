"use client";

import React from "react";

const LANG_MAP: Record<string, string> = {
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  hi: "Hindi",
  mr: "Marathi",
  ml: "Malayalam",
  bn: "Bengali",
};

interface LanguageBadgeProps {
  code: string;
}

export default function LanguageBadge({ code }: LanguageBadgeProps) {
  const normalized = code.toLowerCase();
  const label = LANG_MAP[normalized] ?? code.toUpperCase();

  return (
    <span className="border border-gray-200 rounded px-2 py-0.5 text-[10px] font-sans text-gray-500 font-semibold tracking-wide uppercase bg-white">
      {label}
    </span>
  );
}
