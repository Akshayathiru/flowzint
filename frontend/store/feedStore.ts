import { create } from "zustand";
import { FeedEvent } from "@/types";

const initialEvents: FeedEvent[] = [
  {
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    type: "settlement",
    message: "Pool #2 for Tomato settled! Buyer B (Sri Lakshmi Wholesale) is the winner with a bid of ₹15/kg ✅",
  },
  {
    timestamp: new Date(Date.now() - 5 * 60 * 1000 - 30 * 1000).toISOString(),
    type: "callback_sent",
    message: "Bulbul called Buyer B (Sri Lakshmi Wholesale) at +91 79XXX — Confirmed ✅",
  },
  {
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    type: "buyer_bid",
    message: "Buyer A (Ramesh Traders) placed a bid of ₹14/kg on Pool #2",
  },
  {
    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    type: "callback_sent",
    message: "Bulbul called Buyer C (Murugan Agro Processors) at +91 98XXX — No Answer ❌",
  },
  {
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    type: "farmer_call",
    message: "Farmer +91 88888 77777 called in — 20kg Tomato, Kanchipuram",
    meta: { language: "ta" }
  }
];

interface FeedStore {
  events: FeedEvent[];
  addEvent: (event: FeedEvent) => void;
  clearEvents: () => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  events: initialEvents,
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 50),
    })),
  clearEvents: () => set({ events: [] }),
}));

