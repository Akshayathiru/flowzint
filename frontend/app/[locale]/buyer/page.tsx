"use client";

import { useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";

export default function BuyerRedirect() {
  const router = useRouter();
  const { isLoggedIn, hasHydrated } = useBuyerSessionStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (isLoggedIn) {
      router.replace("/buyer/auctions");
    } else {
      router.replace("/login");
    }
  }, [hasHydrated, isLoggedIn, router]);

  return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-soil-brown border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-semibold">Redirecting...</p>
      </div>
    </div>
  );
}
