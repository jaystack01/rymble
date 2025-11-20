"use client";

import { useEffect, useRef, useState } from "react";
import { useChannel } from "@/context/channel_context";
import { useMembers } from "@/context/members_context";
import { useSocket, useSocketActions } from "@/context/socket_context";
import { useAuth } from "@/context/auth_context";
import api from "@/lib/api";
import { Message } from "@/types/shared";

export default function ChatWindow() {
  const { currentChannel } = useChannel();
  const { selectedMember } = useMembers();
  const { user } = useAuth();

  const socket = useSocket();
  const { joinRoom, leaveRoom } = useSocketActions();

  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Determine active room
  const isDM = !!selectedMember;
  const roomId = isDM
    ? [user?._id, selectedMember?._id].sort().join("_")
    : currentChannel?._id;

  const headerTitle = isDM
    ? `@${selectedMember?.displayName || selectedMember?.username}`
    : `#${currentChannel?.name}`;

  // Fetch messages when room changes
  useEffect(() => {
    if (!roomId) return;

    const load = async () => {
      try {
        const { data } = await api.get<Message[]>(
          `/messages/${roomId}?type=${isDM ? "dm" : "channel"}`
        );
        setMessages(data);
      } catch (err) {
        console.error("Message fetch error:", err);
      }
    };

    Promise.resolve(() => setMessages([]));
    load();
  }, [roomId, isDM]);

  // Join / leave socket room
  useEffect(() => {
    if (!roomId) return;
    joinRoom(roomId);

    return () => leaveRoom(roomId);
  }, [roomId, joinRoom, leaveRoom]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handler = (msg: Message) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", handler);
    return () => {
      socket.off("receive_message", handler);
    };
  }, [socket, roomId]);

  // Auto-scroll
  useEffect(() => {
    requestAnimationFrame(() =>
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    );
  }, [messages]);

  // Guard UI
  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a channel or member to chat.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="border-b border-gray-800 p-4 text-lg font-semibold text-white">
        {headerTitle}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg) => (
          <div key={msg._id} className="flex flex-col text-white">
            <span className="text-sm font-medium text-blue-400">
              {msg.sender?.displayName || msg.sender?.username || "Unknown"}
            </span>

            <span className="text-gray-300 break-words">{msg.text}</span>

            <span className="text-xs text-gray-500">
              {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}

        <div ref={scrollRef} />
      </div>
    </div>
  );
}
