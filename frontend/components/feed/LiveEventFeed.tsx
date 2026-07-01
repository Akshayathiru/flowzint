// TODO: replace with usePoolSocket() WebSocket subscription

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import LanguageBadge from "@/components/shared/LanguageBadge";

interface FeedEvent {
  time: string;
  type: "farmer_call" | "buyer_bid" | "pool_close" | "callback_sent" | "settlement";
  message: string;
  lang?: string;
}

const demoEvents: FeedEvent[] = [
  {
    time: "09:47",
    type: "farmer_call",
    message: "Farmer +91 98XXX called in — 80kg Tomatoes, Kanchipuram",
    lang: "ta",
  },
  {
    time: "09:46",
    type: "buyer_bid",
    message: "Bulbul called Buyer A — ₹14/kg offer received",
  },
  {
    time: "09:45",
    type: "pool_close",
    message: "Pool KAN-TOM-001 closed — 1020kg threshold reached",
  },
  {
    time: "09:44",
    type: "farmer_call",
    message: "Farmer +91 97XXX called in — 350kg Tomatoes, Kanchipuram",
    lang: "te",
  },
  {
    time: "09:43",
    type: "callback_sent",
    message: "Bulbul called +91 96XXX in Tamil — Confirmed ✅",
  },
];

import { useFeedStore } from "@/store/feedStore";
import { usePoolSocket } from "@/hooks/usePoolSocket";

export default function LiveEventFeed() {
  // Activate the WebSocket subscription
  usePoolSocket();

  const containerRef = useRef<HTMLDivElement>(null);
  const { events } = useFeedStore();
  const [isPaused, setIsPaused] = React.useState(false);

  const formatTime = (isoString: string) => {
    if (!isoString) return "00:00";
    try {
      const d = new Date(isoString);
      return d.toTimeString().substring(0, 5);
    } catch {
      return "00:00";
    }
  };


  const renderMessageWithLinks = (message: string) => {
    if (!message) return "";
    const phoneRegex = /(\+91\s?\d+X+\s?\d*)/g;
    const parts = message.split(phoneRegex);
    return parts.map((part, index) => {
      if (phoneRegex.test(part)) {
        return (
          <Link
            key={index}
            href={`/farmers/${encodeURIComponent(part.trim())}`}
            className="text-sky-blue hover:underline font-mono font-medium"
          >
            {part}
          </Link>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Auto-scroll when events change
  useEffect(() => {
    if (containerRef.current && !isPaused) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events, isPaused]);

  const getDotColorClass = (type: any) => {
    switch (type) {
      case "farmer_call":
        return "bg-sky-blue";
      case "buyer_bid":
        return "bg-harvest-gold";
      case "pool_close":
        return "bg-soil-brown";
      case "callback_sent":
        return "bg-field-green";
      case "settlement":
        return "bg-emerald-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors flex flex-col flex-1">
      <div className="flex justify-between items-center mb-3">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Live Event Feed
        </span>
        {isPaused && (
          <span className="font-sans text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded animate-pulse">
            PAUSED (HOVERING)
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        role="log"
        aria-live="polite"
        aria-label="Live event feed"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="overflow-y-auto max-h-[220px] flex-1 divide-y divide-gray-100 pr-1 transition-all"
      >
        {events.map((event: any, index: number) => (
          <div
            key={index}
            className="flex items-start gap-3 py-2.5 last:pb-0 first:pt-0"
          >
            {/* Time */}
            <span className="font-mono text-xs text-gray-500 w-10 shrink-0 select-none">
              {formatTime(event.timestamp)}
            </span>

            {/* Icon Dot */}
            <span
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getDotColorClass(
                event.type
              )}`}
            />

            {/* Message */}
            <span className="font-sans text-xs text-gray-655 leading-normal">
              {renderMessageWithLinks(event.message)}
            </span>

            {/* Language Tag */}
            {(event.lang || event.meta?.language) && (
              <div className="ml-auto shrink-0">
                <LanguageBadge code={event.lang || event.meta?.language} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

