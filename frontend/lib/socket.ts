import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const rawBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const backendUrl = rawBackendUrl.trim().replace(/\n/g, "").replace(/\r/g, "");
    const defaultWsUrl = backendUrl.replace(/^http/, "ws");
    const rawWsUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;
    const wsUrl = rawWsUrl.trim().replace(/\n/g, "").replace(/\r/g, "");

    socket = io(wsUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("[Mandi Mitra] WebSocket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Mandi Mitra] WebSocket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("[Mandi Mitra] WebSocket error:", err.message);
    });
  }
  return socket!;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
