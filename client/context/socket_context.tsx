"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth_context";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  roomPresence: Record<string, { onlineCount: number }>;
  sendMessage: (
    roomId: string,
    text: string,
    isDm?: boolean,
    recipientId?: string
  ) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [roomPresence, setRoomPresence] = useState<
    Record<string, { onlineCount: number }>
  >({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const s = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = s;
    Promise.resolve().then(() => setSocket(s));

    // Presence events
    s.on("presence:init", ({ online }) => setOnlineUsers(online || []));
    s.on("user:online", ({ userId }) =>
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      )
    );
    s.on("user:offline", ({ userId }) =>
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    );
    s.on("room:presence", ({ roomId, onlineCount }) =>
      setRoomPresence((prev) => ({ ...prev, [roomId]: { onlineCount } }))
    );

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setOnlineUsers([]);
      setRoomPresence({});
    };
  }, [token]);

  const sendMessage = useCallback(
    (roomId: string, text: string, isDm = false, recipientId?: string) => {
      socketRef.current?.emit("send_message", {
        roomId,
        message: text,
        isDm,
        recipientId,
      });
    },
    []
  );

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

export const useSocket = () => useContext(SocketContext)?.socket || null;

export const useSocketActions = (): Pick<
  SocketContextType,
  "sendMessage" | "joinRoom" | "leaveRoom"
> => {
  const ctx = useContext(SocketContext);
  if (!ctx)
    return { sendMessage: () => {}, joinRoom: () => {}, leaveRoom: () => {} };
  return {
    sendMessage: ctx.sendMessage,
    joinRoom: ctx.joinRoom,
    leaveRoom: ctx.leaveRoom,
  };
};

export const usePresence = (): Pick<
  SocketContextType,
  "onlineUsers" | "roomPresence"
> => {
  const ctx = useContext(SocketContext);
  if (!ctx) return { onlineUsers: [], roomPresence: {} };
  return { onlineUsers: ctx.onlineUsers, roomPresence: ctx.roomPresence };
};
