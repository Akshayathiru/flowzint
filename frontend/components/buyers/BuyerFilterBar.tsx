"use client";

import React from "react";
import { Search } from "lucide-react";
import { CROPS, DISTRICTS } from "@/lib/constants";

interface BuyerFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  crop: string;
  setCrop: (val: string) => void;
  district: string;
  setDistrict: (val: string) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (val: "all" | "active" | "inactive") => void;
}

export default function BuyerFilterBar({
  search,
  setSearch,
  crop,
  setCrop,
  district,
  setDistrict,
  statusFilter,
  setStatusFilter,
}: BuyerFilterBarProps) {
  const toggleStatus = (target: "active" | "inactive") => {
    if (statusFilter === target) {
      setStatusFilter("all"); // Toggle off -> reset to all
    } else {
      setStatusFilter(target);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-300 transition-colors flex flex-col md:flex-row items-stretch md:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg font-sans text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all bg-white text-charcoal"
        />
      </div>

      {/* Crop Filter */}
      <select
        value={crop}
        onChange={(e) => setCrop(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
      >
        <option value="all">All Crops</option>
        {CROPS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* District Filter */}
      <select
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
      >
        <option value="all">All Districts</option>
        {DISTRICTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      {/* Status Toggle Pills */}
      <div
        role="group"
        aria-label="Buyer status filter"
        className="flex items-center gap-2 select-none"
      >
        <span className="font-sans text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-1 hidden sm:inline">
          Status:
        </span>
        <button
          role="radio"
          aria-checked={statusFilter === "active"}
          onClick={() => toggleStatus("active")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault();
              toggleStatus("inactive");
            }
          }}
          className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold cursor-pointer transition-colors shadow-sm ${
            statusFilter === "active"
              ? "bg-charcoal text-white"
              : "border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
          }`}
        >
          Active
        </button>
        <button
          role="radio"
          aria-checked={statusFilter === "inactive"}
          onClick={() => toggleStatus("inactive")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault();
              toggleStatus("active");
            }
          }}
          className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold cursor-pointer transition-colors shadow-sm ${
            statusFilter === "inactive"
              ? "bg-charcoal text-white"
              : "border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
          }`}
        >
          Inactive
        </button>
      </div>
    </div>
  );
}
