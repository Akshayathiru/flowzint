import { create } from "zustand";

interface DemoStore {
  isDemoMode: boolean;
  activePoolId: string | null;
  setActivePoolId: (id: string | null) => void;
  demoEvents: Array<{ time: string; message: string; type: string }>;
  addDemoEvent: (event: { time: string; message: string; type: string }) => void;
  clearDemoEvents: () => void;
  scenarioStep: number;
  advanceScenario: () => void;
  resetScenario: () => void;
}

export const useDemoStore = create<DemoStore>((set) => ({
  isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
  activePoolId: "KAN-TOM-001",
  setActivePoolId: (id) => set({ activePoolId: id }),
  demoEvents: [],
  addDemoEvent: (event) =>
    set((state) => ({ demoEvents: [event, ...state.demoEvents] })),
  clearDemoEvents: () => set({ demoEvents: [] }),
  scenarioStep: 0,
  advanceScenario: () =>
    set((state) => ({ scenarioStep: state.scenarioStep + 1 })),
  resetScenario: () => set({ scenarioStep: 0, demoEvents: [] }),
}));
