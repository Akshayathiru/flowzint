import { create } from 'zustand'

interface FarmerSession {
  phone: string | null
  isLoggedIn: boolean
  setPhone: (phone: string) => void
  clearSession: () => void
}

export const useFarmerSessionStore = create<FarmerSession>((set) => ({
  phone: null,
  isLoggedIn: false,
  setPhone: (phone) => set({ phone, isLoggedIn: true }),
  clearSession: () => set({ phone: null, isLoggedIn: false }),
}))
