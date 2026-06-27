import { NextResponse } from "next/server";

// TODO: proxy to FastAPI GET /api/buyers/:id/calls
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`Fetching calls for buyer ${params.id} via ${request.url}`);
  return NextResponse.json([
    {
      poolId: "KAN-TOM-001",
      date: "Today 09:46",
      crop: "Tomatoes",
      district: "Kanchipuram",
      bid: 15,
      result: "won",
      lotQtyKg: 1020,
    },
    {
      poolId: "VEL-ONI-002",
      date: "Yesterday",
      crop: "Onions",
      district: "Vellore",
      bid: 17,
      result: "lost",
      lotQtyKg: 640,
    },
    {
      poolId: "KAN-TOM-008",
      date: "3 days ago",
      crop: "Tomatoes",
      district: "Kanchipuram",
      bid: 13,
      result: "won",
      lotQtyKg: 750,
    },
    {
      poolId: "CHE-POT-003",
      date: "5 days ago",
      crop: "Potatoes",
      district: "Chengalpattu",
      bid: null,
      result: "no_answer",
      lotQtyKg: 880,
    },
  ]);
}
