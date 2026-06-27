import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000", {
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
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
