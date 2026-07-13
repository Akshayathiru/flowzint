import { BuyerProfile, AuctionPool } from "@/types";

export const MOCK_BUYERS: BuyerProfile[] = [
  { buyer_id: 1, name: "Ramesh Traders", phone: "8012345001", crop: "tomato", location: "kanchipuram", min_quantity: 200 },
  { buyer_id: 2, name: "Sri Lakshmi Wholesale", phone: "7912345002", crop: "onion", location: "vellore", min_quantity: 300 },
  { buyer_id: 3, name: "Murugan Agro Processors", phone: "9812345003", crop: "tomato", location: "chengalpattu", min_quantity: 500 },
];

export const MOCK_AUCTION_POOLS: AuctionPool[] = [
  {
    pool_id: 1,
    crop: "tomato",
    location: "kanchipuram",
    current_qty_kg: 820,
    target_qty_kg: 1000,
    farmers_count: 6,
    status: "auctioning",
    auctionEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    auctionClosed: false,
  },
  {
    pool_id: 2,
    crop: "soya beans",
    location: "vellore",
    current_qty_kg: 312,
    target_qty_kg: 500,
    farmers_count: 4,
    status: "auctioning",
    auctionEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    auctionClosed: false,
  },
  {
    pool_id: 3,
    crop: "potato",
    location: "chengalpattu",
    current_qty_kg: 500,
    target_qty_kg: 500,
    farmers_count: 8,
    status: "settled",
    auctionEndTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    auctionClosed: true,
  },
];

export const MOCK_BID_HISTORY = [
  { pool_id: 1, price: 15.5, quantity: 300, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), crop: "tomato", location: "kanchipuram" },
  { pool_id: 3, price: 12.0, quantity: 200, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), crop: "potato", location: "chengalpattu" },
];

export const MOCK_POOL_FARMERS: Record<number, any[]> = {
  1: [
    { phone: "+91 98765 43210", quantity_kg: 150, call_time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), language: "ta", trust_score: 4.8 },
    { phone: "+91 87654 32109", quantity_kg: 200, call_time: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), language: "hi", trust_score: 3.9 },
    { phone: "+91 76543 21098", quantity_kg: 120, call_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), language: "ta", trust_score: 4.2 },
    { phone: "+91 65432 10987", quantity_kg: 180, call_time: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), language: "te", trust_score: 2.5 },
    { phone: "+91 94444 55555", quantity_kg: 170, call_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), language: "kn", trust_score: 4.5 },
  ],
  2: [
    { phone: "+91 95555 66666", quantity_kg: 100, call_time: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), language: "hi", trust_score: 4.0 },
    { phone: "+91 96666 77777", quantity_kg: 120, call_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), language: "ta", trust_score: 3.5 },
    { phone: "+91 97777 88888", quantity_kg: 92, call_time: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), language: "kn", trust_score: 1.8 },
  ],
  3: [
    { phone: "+91 98888 99999", quantity_kg: 250, call_time: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), language: "ta", trust_score: 4.9 },
    { phone: "+91 99999 00000", quantity_kg: 250, call_time: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), language: "te", trust_score: 4.6 },
  ]
};

