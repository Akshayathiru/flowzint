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
  phone: string
  qtyKg: number
  language: string
  calledAt: string
  trustScore: number
  confidence: number
  isFirstCall: boolean
  callbackStatus: 'pending' | 'called' | 'confirmed' | 'declined' | 'no_answer'
  farmerResponse: 'yes' | 'no' | 'no_answer' | 'pending'
}

export interface FarmerCallPayload {
  phone: string
  rawTranscript: string
  detectedLanguage: string
  extractedData: {
    commodity: string
    quantityKg: number
    location: string
    confidence: number
  }
}

export interface BuyerCallResult {
  buyerId: string
  callDuration: number
  rawTranscript: string
  extractedBidPerKg: number
  confidence: number
  callStatus: 'completed' | 'no_answer' | 'rejected'
}

export interface FarmerCallbackResult {
  phone: string
  language: string
  deliveredMessage: string
  farmerResponse: 'yes' | 'no' | 'no_answer'
  callStatus: 'completed' | 'no_answer'
}

export interface AuctionEntry {
  buyerName: string
  phone: string
  callStatus: 'completed' | 'no_answer' | 'rejected'
  bid: number | null
  timestamp: string
  isWinning?: boolean
}

export interface CatchmentZone {
  name: string
  lat: number
  lng: number
  radiusKm: number
}

export type UserRole = 'admin' | 'operator' | 'viewer'

export interface AuthUser {
  userId: string
  email: string
  role: UserRole
  orgId: string;
}

export interface BuyerProfile {
  buyer_id: number
  name: string
  phone: string
  crop: string
  location: string
  min_quantity: number
}

export interface AuctionPool {
  pool_id: number
  crop: string
  location: string
  current_qty_kg: number
  target_qty_kg: number
  farmers_count: number
  status: 'filling' | 'auctioning' | 'settled'
  auctionEndTime: string | null  // ISO UTC timestamp
  auctionClosed: boolean
}

export interface BidSubmission {
  buyer_id: number
  pool_id: number
  price: number
  quantity: number
}

export interface PoolAllocation {
  buyer_id: number
  allocated_quantity: number
  price: number
}

export interface SettlementResult {
  pool_id: number
  status: string
  allocations: PoolAllocation[]
}

