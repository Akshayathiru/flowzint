"use client";

import React from "react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useTranslations } from "next-intl";
import { WifiOff, Loader2 } from "lucide-react";

export function ConnectionBanner() {
  const status = useConnectionStatus();
  const t = useTranslations("errors");

  if (status === "connected") return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 font-sans text-xs font-semibold select-none shadow-sm transition-all duration-300 ${
        status === "disconnected"
          ? "bg-alert-red text-white"
          : "bg-harvest-gold text-soil-brown"
      }`}
    >
      {status === "reconnecting" ? (
        <>
          <Loader2 size={12} className="animate-spin" />
          <span>{t("ws_disconnected")}</span>
        </>
      ) : (
        <>
          <WifiOff size={12} />
          <span>{t("network_offline")}</span>
        </>
      )}
    </div>
  );
}
