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
    auctionEndTime: new Date(Date.now() + 18 * 60 * 1000).toISOString(), // 18 min from now
    auctionClosed: false,
  },
  {
    pool_id: 2,
    crop: "onion",
    location: "vellore",
    current_qty_kg: 312,
    target_qty_kg: 500,
    farmers_count: 4,
    status: "filling",
    auctionEndTime: null,
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
