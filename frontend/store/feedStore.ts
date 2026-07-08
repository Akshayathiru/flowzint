import { create } from "zustand";
import { FeedEvent } from "@/types";

interface FeedStore {
  events: FeedEvent[];
  addEvent: (event: FeedEvent) => void;
  clearEvents: () => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  events: [],
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 50),
    })),
  clearEvents: () => set({ events: [] }),
}));
