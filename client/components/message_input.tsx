"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/context/auth_context";
import { useChannel } from "@/context/channel_context";
import { useMembers } from "@/context/members_context";
import { useSocketActions } from "@/context/socket_context";

export default function MessageInput() {
  const { user } = useAuth();
  const { currentChannel } = useChannel();
  const { selectedMember } = useMembers();
  const { sendMessage } = useSocketActions();

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const isDM = !!selectedMember;

  const roomId = isDM
    ? [user?._id, selectedMember?._id].sort().join("_")
    : currentChannel?._id;

  const placeholder = isDM
    ? `Message @${selectedMember?.displayName || selectedMember?.username}`
    : `Message #${currentChannel?.name}`;

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !roomId || !user || isSending) return;

    setIsSending(true);

    try {
      await sendMessage({
        roomId,
        text: text.trim(),
        type: isDM ? "dm" : "channel",
        recipientId: isDM ? selectedMember?._id : undefined,
      });

      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!roomId) {
    return (
      <div className="p-4 border-t border-zinc-800 text-zinc-600 bg-zinc-950 text-center">
        Select a channel or member to start messaging.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSend}
      className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center space-x-3"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
        disabled={isSending}
      />

      <button
        type="submit"
        disabled={!text.trim() || isSending}
        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
      >
        Send
      </button>
    </form>
  );
}
