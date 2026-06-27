"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connected");

  useEffect(() => {
    const socket = getSocket();
    const handleDisconnect = () => setStatus("disconnected");
    const handleConnect = () => setStatus("connected");
    const handleReconnectAttempt = () => setStatus("reconnecting");

    // Initial state check
    if (socket.connected) {
      setStatus("connected");
    } else {
      setStatus("disconnected");
    }

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);
    socket.on("reconnect_attempt", handleReconnectAttempt);

    // Also watch browser online/offline
    const handleOffline = () => setStatus("disconnected");
    const handleOnline = () => setStatus("reconnecting");
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
