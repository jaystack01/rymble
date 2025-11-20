"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth_context";

interface SendMessagePayload {
  roomId: string;
  text: string;
  type: "dm" | "channel";
  recipientId?: string;
}

interface RoomPresence {
  onlineCount: number;
}

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  roomPresence: Record<string, RoomPresence>;

  sendMessage: (payload: SendMessagePayload) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();

  const socketRef = useRef<Socket | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [roomPresence, setRoomPresence] = useState<
    Record<string, RoomPresence>
  >({});

  // Initialize socket
  useEffect(() => {
    if (!token) return;

    const s = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = s;
    Promise.resolve().then(() => setSocket(s));

    // presence
    s.on("presence:init", ({ online }) => {
      setOnlineUsers(online || []);
    });

    s.on("user:online", ({ userId }) => {
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    });

    s.on("user:offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    s.on("room:presence", ({ roomId, onlineCount }) => {
      setRoomPresence((prev) => ({
        ...prev,
        [roomId]: { onlineCount },
      }));
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setOnlineUsers([]);
      setRoomPresence({});
    };
  }, [token]);

  // send message
  const sendMessage = useCallback((payload: SendMessagePayload) => {
    const { roomId, text, type, recipientId } = payload;

    socketRef.current?.emit("send_message", {
      roomId,
      message: text,
      isDm: type === "dm",
      recipientId,
    });
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketRef.current?.emit("join_room", roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.emit("leave_room", roomId);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        roomPresence,
        sendMessage,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Hooks
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  return ctx?.socket ?? null;
};

export const useSocketActions = () => {
  const ctx = useContext(SocketContext);
  if (!ctx)
    return {
      sendMessage: () => {},
      joinRoom: () => {},
      leaveRoom: () => {},
    };

  return {
    sendMessage: ctx.sendMessage,
    joinRoom: ctx.joinRoom,
    leaveRoom: ctx.leaveRoom,
  };
};

export const usePresence = () => {
  const ctx = useContext(SocketContext);
  return {
    onlineUsers: ctx?.onlineUsers ?? [],
    roomPresence: ctx?.roomPresence ?? {},
  };
};
