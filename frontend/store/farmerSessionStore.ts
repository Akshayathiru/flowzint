import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FarmerSession {
  phone: string | null
  isLoggedIn: boolean
  setPhone: (phone: string) => void
  clearSession: () => void
}

export const useFarmerSessionStore = create<FarmerSession>()(
  persist(
    (set) => ({
      phone: null,
      isLoggedIn: false,
      setPhone: (phone) => set({ phone, isLoggedIn: true }),
      clearSession: () => {
        set({ phone: null, isLoggedIn: false })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mandi-farmer-session')
        }
      },
    }),
    {
      name: 'mandi-farmer-session',
    }
  )
)
