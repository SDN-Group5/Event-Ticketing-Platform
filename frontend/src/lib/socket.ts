import { io, Socket } from "socket.io-client";

// Socket.IO client instance
let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:7002";
  
  socket = io(backendUrl, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    // Đã tắt log để giảm noise trong console
    // if (import.meta.env.DEV) {
    //   console.log("✅ Socket.IO connected");
    // }
  });

  socket.on("disconnect", () => {
    // Socket disconnected - chỉ log errors
  });

  socket.on("connect_error", (_error) => {
    // Đã tắt log để giảm noise trong console
    // console.error("❌ Socket.IO connection error:", _error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

