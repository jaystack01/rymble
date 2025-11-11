"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./auth_context";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // array of userIds
  const [roomPresence, setRoomPresence] = useState({}); // { roomId: { onlineCount } }

  useEffect(() => {
    if (!token) return;

    // Initialize socket with JWT auth
    const socket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    // Presence handlers
    const handleInit = ({ online }) => {
      setOnlineUsers(online || []);
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    };

    const handleRoomPresence = ({ roomId, onlineCount }) => {
      setRoomPresence((prev) => ({ ...prev, [roomId]: { onlineCount } }));
    };

    socket.on("presence:init", handleInit);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    socket.on("room:presence", handleRoomPresence);

    // Cleanup on unmount or token change
    return () => {
      socket.off("presence:init", handleInit);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("room:presence", handleRoomPresence);
      socket.disconnect();
      socketRef.current = null;
      setOnlineUsers([]);
      setRoomPresence({});
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socketRef, onlineUsers, roomPresence }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use socket in components (keeps previous API)
export const useSocket = () => useContext(SocketContext)?.socketRef?.current;

// Hook to access presence info
export const usePresence = () => {
  const ctx = useContext(SocketContext) || {};
  return { onlineUsers: ctx.onlineUsers || [], roomPresence: ctx.roomPresence || {} };
};
