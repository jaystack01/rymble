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

  // room id: always deterministic for DM
  const roomId = isDM
    ? [user?._id, selectedMember?._id].sort().join("_")
    : currentChannel?._id;

  const placeholder = isDM
    ? `Message @${selectedMember?.displayName || selectedMember?.username}`
    : `Message #${currentChannel?.name}`;

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault();

    if (!text.trim() || !roomId || !user) return;

    setIsSending(true);

    sendMessage({
      roomId,
      text: text.trim(),
      type: isDM ? "dm" : "channel",
      recipientId: isDM ? selectedMember?._id : undefined,
    });

    setText("");
    setIsSending(false);
  };

  if (!roomId) {
    return (
      <div className="p-4 border-t border-gray-800 text-gray-500 text-center">
        Select a channel or member to start messaging.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSend}
      className="p-4 border-t border-gray-800 bg-gray-900 flex items-center space-x-2"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isSending}
      />

      <button
        type="submit"
        disabled={!text.trim() || isSending}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
