import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FarmerSession {
  phone: string | null
  isLoggedIn: boolean
  hasHydrated: boolean
  setPhone: (phone: string) => void
  clearSession: () => void
  setHasHydrated: (state: boolean) => void
}

export const useFarmerSessionStore = create<FarmerSession>()(
  persist(
    (set) => ({
      phone: null,
      isLoggedIn: false,
      hasHydrated: false,
      setPhone: (phone) => set({ phone, isLoggedIn: true }),
      clearSession: () => {
        set({ phone: null, isLoggedIn: false })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mandi-farmer-session')
        }
      },
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'mandi-farmer-session',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
