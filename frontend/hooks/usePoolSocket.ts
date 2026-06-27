"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { usePoolStore } from "@/store/poolStore";
import { useFeedStore } from "@/store/feedStore";
import { ActivePool, FeedEvent } from "@/types";

export function usePoolSocket(poolId?: string) {
  const { updatePool, addPool } = usePoolStore();
  const { addEvent } = useFeedStore();

  useEffect(() => {
    const socket = getSocket();

    // Global events
    socket.on("pool:update", (data: ActivePool) => {
      updatePool(data.poolId, data);
    });

    socket.on("pool:new", (data: ActivePool) => {
      addPool(data);
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
      socket.off("pool:update");
      socket.off("pool:new");
      socket.off("feed:event");
      if (poolId) {
        socket.off(`pool:${poolId}:bid`);
        socket.off(`pool:${poolId}:callback`);
      }
    };
  }, [poolId, updatePool, addPool, addEvent]);
}
