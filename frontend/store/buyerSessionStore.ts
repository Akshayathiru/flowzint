import { create } from 'zustand'
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
  bidHistory: LocalBid[]
  addBid: (bid: LocalBid) => void
}

export const useBuyerSessionStore = create<BuyerSessionStore>((set) => ({
  currentBuyer: null,
  isLoggedIn: false,
  bidHistory: [],
  setCurrentBuyer: (buyer) => set({ currentBuyer: buyer, isLoggedIn: !!buyer }),
  addBid: (bid) => set((state) => ({ bidHistory: [bid, ...state.bidHistory] }))
}))
