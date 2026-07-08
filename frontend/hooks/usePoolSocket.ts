"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { usePoolStore } from "@/store/poolStore";
import { useFeedStore } from "@/store/feedStore";
import { ActivePool, FeedEvent } from "@/types";

export function usePoolSocket(poolId?: string) {
  const { updatePool, addPool, setPools } = usePoolStore();
  const { addEvent } = useFeedStore();

  useEffect(() => {
    const socket = getSocket();

    // Fetch state on connect / reconnect
    const fetchCurrentState = () => {
      fetch("/api/pools/active")
        .then((res) => res.json())
        .then((pools) => {
          if (Array.isArray(pools)) {
            setPools(pools);
          }
        })
        .catch((err) => console.error("Failed to re-fetch pools on reconnect:", err));
    };

    socket.on("connect", fetchCurrentState);

    // Global events
    socket.on("pool:update", (data: ActivePool) => {
      updatePool(data.poolId, data);
    });

    socket.on("pool:new", (data: ActivePool) => {
      addPool(data);
    });

    socket.on("pool:settled", (data: { poolId: string; winningPricePerKg: number; settlementIds: string[] }) => {
      updatePool(data.poolId, { status: "settled" as const });
      addEvent({
        timestamp: new Date().toISOString(),
        type: "settlement",
        message: `Pool ${data.poolId} settled at ₹${data.winningPricePerKg}/kg`,
        meta: data
      });
    });

    socket.on("feed:event", (event: FeedEvent) => {
      addEvent(event);
    });

    // Pool-specific events
    if (poolId) {
      socket.on(
        `pool:${poolId}:bid`,
        (data: { buyerName: string; pricePerKg: number }) => {
          addEvent({
            timestamp: new Date().toISOString(),
            type: "buyer_bid",
            message: `${data.buyerName} bid ₹${data.pricePerKg}/kg on pool ${poolId}`,
            meta: data,
          });
        }
      );

      socket.on(
        `pool:${poolId}:callback`,
        (data: { phone: string; language: string }) => {
          addEvent({
            timestamp: new Date().toISOString(),
            type: "callback_sent",
            message: `Farmer ${data.phone} called back in ${data.language}`,
            meta: data,
          });
        }
      );
    }

    return () => {
      socket.off("connect", fetchCurrentState);
      socket.off("pool:update");
      socket.off("pool:new");
      socket.off("feed:event");
      socket.off("pool:settled");
      if (poolId) {
        socket.off(`pool:${poolId}:bid`);
        socket.off(`pool:${poolId}:callback`);
      }
    };
  }, [poolId, updatePool, addPool, setPools, addEvent]);
}
