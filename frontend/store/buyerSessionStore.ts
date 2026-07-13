import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BuyerProfile } from '@/types'

export interface LocalBid {
  pool_id: number
  price: number
  quantity: number
  timestamp: string
  crop: string
  location: string
}

interface BuyerSessionStore {
  currentBuyer: BuyerProfile | null
  setCurrentBuyer: (buyer: BuyerProfile | null) => void
  isLoggedIn: boolean
  hasHydrated: boolean
  bidHistory: LocalBid[]
  addBid: (bid: LocalBid) => void
  clearSession: () => void
  setHasHydrated: (state: boolean) => void
}

export const useBuyerSessionStore = create<BuyerSessionStore>()(
  persist(
    (set) => ({
      currentBuyer: null,
      isLoggedIn: false,
      hasHydrated: false,
      bidHistory: [],
      setCurrentBuyer: (buyer) => set({ currentBuyer: buyer, isLoggedIn: !!buyer }),
      addBid: (bid) => set((state) => ({ bidHistory: [bid, ...state.bidHistory] })),
      clearSession: () => {
        set({ currentBuyer: null, isLoggedIn: false, bidHistory: [] })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mandi-buyer-session')
        }
      },
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'mandi-buyer-session',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
