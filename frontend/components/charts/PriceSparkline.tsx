"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Crown } from "lucide-react";

const data = [
  { time: "09:45", price: 12, type: "mandi_avg", buyer: "Mandi Avg" },
  { time: "09:46", price: 14, type: "bid", buyer: "Buyer A" },
  { time: "09:46:38", price: 15, type: "bid", buyer: "Buyer B (Winner)" },
];

const CustomizedDot = (props: any) => {
  const { cx, cy, payload } = props;
  const fill =
    payload.type === "mandi_avg"
      ? "#E6A817"
      : payload.price === 15
      ? "#2D6A4F"
      : "#3B82F6";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={fill}
      stroke="#FFFFFF"
      strokeWidth={1.5}
    />
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs font-sans">
        <div className="font-bold text-charcoal">₹{item.price}/kg</div>
        <div className="text-gray-400 mt-0.5">
          {item.buyer} &middot; {item.time}
        </div>
      </div>
    );
  }
  return null;
};

export default function PriceSparkline() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between h-full">
      {/* Title */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Auction Price History
        </span>
        <span className="font-sans text-xs font-semibold text-field-green">
          Winner: ₹15/kg
        </span>
      </div>

      {/* Sparkline Chart */}
      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 15, right: 15, left: 15, bottom: 5 }}
          >
            <XAxis dataKey="time" hide />
            <YAxis domain={[10, 17]} hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <ReferenceLine
              y={12}
              stroke="#E6A817"
              strokeDasharray="4 2"
              label={{
                value: "Mandi avg",
                fill: "#E6A817",
                fontSize: 9,
                position: "insideTopLeft",
                offset: 5,
              }}
            />
            <ReferenceLine
              y={15}
              stroke="#2D6A4F"
              strokeDasharray="4 2"
              label={{
                value: "Winner",
                fill: "#2D6A4F",
                fontSize: 9,
                position: "insideTopRight",
                offset: 5,
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={<CustomizedDot />}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Buyer Bids Chips */}
      <div className="flex flex-wrap sm:flex-nowrap gap-3 mt-4">
        {/* Bid 1 */}
        <div className="flex-1 rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between bg-white text-xs">
          <span className="font-sans font-semibold text-gray-500">Buyer A</span>
          <span className="font-display font-semibold text-sm text-charcoal">
            ₹14/kg
          </span>
        </div>

        {/* Bid 2 (Winner) */}
        <div className="flex-1 rounded-lg border border-field-green bg-field-green/5 px-3 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-field-green">
            <span className="font-sans font-bold">Buyer B</span>
            <Crown className="w-3.5 h-3.5 text-harvest-gold" />
          </div>
          <span className="font-display font-extrabold text-sm text-field-green">
            ₹15/kg
          </span>
        </div>
      </div>
    </div>
  );
}
