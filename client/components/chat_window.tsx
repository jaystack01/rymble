"use client";

import { useEffect, useRef, useState } from "react";
import { useChannel } from "@/context/channel_context";
import { useSocket, useSocketActions } from "@/context/socket_context";
import api from "@/lib/api";
import { Message } from "@/types/shared";

export default function ChatWindow() {
  const { currentChannel } = useChannel();
  const { joinRoom, leaveRoom } = useSocketActions();
  const socket = useSocket();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const channelId = currentChannel?._id;

  const fetchedRef = useRef<string | null>(null);

  // Reset & fetch messages once per channel
  useEffect(() => {
    if (!channelId) return;

    // reset UI
    Promise.resolve().then(() => setMessages([]));

    // already fetched once for this channel?
    if (fetchedRef.current === channelId) return;
    fetchedRef.current = channelId;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get<Message[]>(`/messages/${channelId}`);
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [channelId]);

  // Join/leave socket room
  useEffect(() => {
    if (!channelId) return;
    joinRoom(channelId);
    return () => leaveRoom(channelId);
  }, [channelId, joinRoom, leaveRoom]);

  // Listen to live messages
  useEffect(() => {
    if (!socket) return;

    const handler = (msg: Message) => {
      if (msg.roomId === channelId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", handler);
    return () => {
      socket.off("receive_message", handler);
    };
  }, [socket, channelId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    requestAnimationFrame(() =>
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    );
  }, [messages]);

  if (!currentChannel)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a channel to start chatting.
      </div>
    );

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="border-b border-gray-800 p-4 text-lg font-semibold text-white">
        #{currentChannel.name}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg) => (
          <div key={msg._id} className="flex flex-col text-white">
            <span className="text-sm font-medium text-blue-400">
              {msg.sender?.username || "Unknown"}
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
