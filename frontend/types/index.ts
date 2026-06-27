export interface ActivePool {
  poolId: string;
  crop: string;
  location: string;
  currentQtyKg: number;
  targetQtyKg: number;
  farmersCount: number;
  minutesRemaining: number;
  status: "filling" | "closed" | "auctioning" | "settled" | "expired";
  geoCenter: [number, number];
}

export interface FarmerCall {
  phone: string;
  crop: string;
  qtyKg: number;
  language: string;
  trustScore: number;
  timestamp: string;
  status: "pending" | "called" | "confirmed";
}

export interface BuyerBid {
  buyerId: string;
  buyerName: string;
  pricePerKg: number;
  timestamp: string;
  isWinning: boolean;
}

export interface FarmerReceipt {
  phone: string;
  qtyKg: number;
  estimatedEarnings: number;
  smsText: string;
  smsSent: boolean;
}

export interface Settlement {
  poolId: string;
  settledAt: string;
  winningPricePerKg: number;
  totalQtyKg: number;
  buyerName: string;
  premiumOverMandiPct: number;
  farmerReceipts: FarmerReceipt[];
}

export type FeedEventType =
  | "farmer_call"
  | "pool_close"
  | "buyer_bid"
  | "callback_sent"
  | "settlement";

export interface FeedEvent {
  timestamp: string;
  type: FeedEventType;
  message: string;
  meta?: any;
}

export interface FarmerEntry {
  phone: string;
  qtyKg: number;
  language: string;
  trustScore: number;
}
