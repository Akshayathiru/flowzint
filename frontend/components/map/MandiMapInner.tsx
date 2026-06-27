"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "react-leaflet-cluster/lib/assets/MarkerCluster.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.Default.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ClusterGroup: any = (MarkerClusterGroup as any).default || MarkerClusterGroup;
console.log("MarkerClusterGroup type:", typeof MarkerClusterGroup, MarkerClusterGroup);

interface FarmerPin {
  phone: string;
  lat: number;
  lng: number;
  qtyKg: number;
  trustScore: number;
}

interface BuyerPin {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  center?: [number, number];
  radiusKm?: number;
  farmerPins?: FarmerPin[];
  buyerPins?: BuyerPin[];
  onFarmerClick?: (phone: string) => void;
}

const defaultCenter: [number, number] = [12.8342, 79.7036];
const defaultRadiusKm = 20;

const defaultFarmerPins: FarmerPin[] = [
  { phone: "+91 98XXX 10001", lat: 12.8342, lng: 79.7036, qtyKg: 200, trustScore: 4.2 },
  { phone: "+91 97XXX 10002", lat: 12.8198, lng: 79.6891, qtyKg: 150, trustScore: 3.8 },
  { phone: "+91 96XXX 10003", lat: 12.8501, lng: 79.7201, qtyKg: 180, trustScore: 4.5 },
  { phone: "+91 95XXX 10004", lat: 12.8089, lng: 79.6754, qtyKg: 220, trustScore: 2.9 },
  { phone: "+91 94XXX 10005", lat: 12.8634, lng: 79.7388, qtyKg: 130, trustScore: 1.8 },
  { phone: "+91 93XXX 10006", lat: 12.8445, lng: 79.7105, qtyKg: 140, trustScore: 3.1 },
];

const defaultBuyerPins: BuyerPin[] = [
  { name: "Ramesh Traders", lat: 12.8220, lng: 79.7010 },
];

function AutoFitBounds({ pins }: { pins: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length > 0) {
      map.fitBounds(pins, { padding: [40, 40] });
    }
  }, [pins, map]);
  return null;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="font-sans text-[10px] text-gray-500 font-semibold leading-none">
        {label}
      </span>
    </div>
  );
}

export default function MandiMapInner({
  center = defaultCenter,
  radiusKm = defaultRadiusKm,
  farmerPins = defaultFarmerPins,
  buyerPins = defaultBuyerPins,
  onFarmerClick,
}: Props) {
  // TODO: replace hardcoded pins with farmerPins and buyerPins from usePool(poolId)

  const boundsPins = [
    center,
    ...farmerPins.map((f) => [f.lat, f.lng] as [number, number]),
    ...buyerPins.map((b) => [b.lat, b.lng] as [number, number]),
  ];

  return (
    <div className="w-full h-full relative z-10">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Catchment ring */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#6B4226",
            fillColor: "#6B4226",
            fillOpacity: 0.04,
            weight: 1.5,
            dashArray: "6 4",
          }}
        />

        {/* Farmer pins */}
        {/* TODO: when farmer count exceeds 50, clustering becomes essential — test with real data */}
        <ClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div style="
                background: #6B4226;
                color: white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Inter, sans-serif;
                font-size: 11px;
                font-weight: 600;
                border: 2px solid white;
                box-shadow: 0 1px 4px rgba(0,0,0,0.2);
              ">${count}</div>`,
              className: "",
              iconSize: L.point(32, 32),
            });
          }}
        >
          {farmerPins.map((f) => (
            <CircleMarker
              key={f.phone}
              center={[f.lat, f.lng]}
              radius={6}
              pathOptions={{
                color:
                  f.trustScore >= 3.5
                    ? "#2D6A4F"
                    : f.trustScore >= 2.0
                    ? "#D97706"
                    : "#DC2626",
                fillColor:
                  f.trustScore >= 3.5
                    ? "#2D6A4F"
                    : f.trustScore >= 2.0
                    ? "#D97706"
                    : "#DC2626",
                fillOpacity: 0.8,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => onFarmerClick?.(f.phone),
              }}
            >
              <Popup>
                <div className="font-sans text-xs p-0.5">
                  <div className="font-bold text-charcoal">{f.phone}</div>
                  <div className="text-gray-500 mt-0.5">
                    {f.qtyKg}kg &middot; Trust: {f.trustScore}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </ClusterGroup>

        {/* Buyer pins */}
        {buyerPins.map((b) => (
          <CircleMarker
            key={b.name}
            center={[b.lat, b.lng]}
            radius={9}
            pathOptions={{
              color: "#E6A817",
              fillColor: "#E6A817",
              fillOpacity: 0.9,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="font-sans text-xs font-bold text-charcoal p-0.5">
                {b.name}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <AutoFitBounds pins={boundsPins} />
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white rounded-lg border border-gray-200 p-2.5 shadow-sm flex flex-col gap-1.5 max-w-[150px]">
        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">
          Legend
        </div>
        <LegendItem color="#2D6A4F" label="High trust farmer" />
        <LegendItem color="#D97706" label="Medium trust farmer" />
        <LegendItem color="#DC2626" label="Low trust farmer" />
        <LegendItem color="#E6A817" label="Buyer location" />
      </div>
    </div>
  );
}
