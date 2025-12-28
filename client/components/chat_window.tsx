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

  // detect DM or channel
  const isDM = !!selectedMember;

  const roomId = isDM
    ? [user?._id, selectedMember?._id].sort().join("_")
    : currentChannel?._id;

  const headerTitle = isDM
    ? `@${selectedMember?.displayName || selectedMember?.username}`
    : `#${currentChannel?.name}`;

  /* ---------------------------------------------------------------------- */
  /* FETCH MESSAGES                                                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await api.get<Message[]>(
          `/messages/${roomId}?type=${isDM ? "dm" : "channel"}`
        );
        if (!cancelled) setMessages(data);
      } catch (err) {
        console.error("Message fetch error:", err);
      }
    };

    // clear FIRST (sync), then async fetch happens separately
    
    Promise.resolve().then(() => setMessages([]));
    load();

    return () => {
      cancelled = true;
    };
  }, [roomId, isDM]);

  /* ---------------------------------------------------------------------- */
  /* JOIN ROOM                                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!roomId) return;

    joinRoom(roomId);

    return () => {
      // ensure cleanup returns void
      leaveRoom(roomId);
    };
  }, [roomId, joinRoom, leaveRoom]);

  /* ---------------------------------------------------------------------- */
  /* LISTEN FOR NEW MESSAGES                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!socket || !roomId) return;

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

  /* ---------------------------------------------------------------------- */
  /* AUTO SCROLL                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages]);

  /* ---------------------------------------------------------------------- */

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600 bg-zinc-950">
        Select a channel or member to chat.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 border-l border-zinc-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <h2 className="text-white font-semibold text-lg truncate">
          {headerTitle}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-zinc-600 py-10">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm text-zinc-500">
              This place is quiet. Start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageItem key={msg._id} msg={msg} />)
        )}

        <div ref={scrollRef} />
      </div>
    </div>
  );
}

/* MESSAGE ITEM */
function MessageItem({ msg }: { msg: Message }) {
  const sender =
    msg.sender?.displayName || msg.sender?.username || "Unknown User";

  return (
    <div className="flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 shadow-sm hover:bg-zinc-900/60 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white">{sender}</span>
        <span className="text-xs text-zinc-500">
          {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <p className="text-zinc-300 whitespace-pre-wrap break-words">
        {msg.text}
      </p>
    </div>
  );
}
