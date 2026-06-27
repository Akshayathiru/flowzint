"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connected");

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setStatus("connected");
      return;
    }

    const socket = getSocket();

    const updateStatus = () => {
      if (typeof window !== "undefined" && !navigator.onLine) {
        setStatus("disconnected");
      } else if (socket.connected) {
        setStatus("connected");
      } else {
        setStatus("reconnecting");
      }
    };

    updateStatus();

    const handleDisconnect = () => updateStatus();
    const handleConnect = () => updateStatus();
    const handleReconnectAttempt = () => setStatus("reconnecting");
    const handleOffline = () => setStatus("disconnected");
    const handleOnline = () => updateStatus();

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);
    socket.on("reconnect_attempt", handleReconnectAttempt);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
      socket.off("reconnect_attempt", handleReconnectAttempt);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return status;
}
