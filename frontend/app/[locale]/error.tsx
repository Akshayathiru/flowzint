"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled client error caught in boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-warm-cream font-sans p-6 w-full">
      <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md w-full text-center shadow-sm">
        <h2 className="text-lg font-display font-bold text-charcoal">Something went wrong!</h2>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 bg-[#1C1C1E] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
