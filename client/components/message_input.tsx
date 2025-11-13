"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/context/auth_context";
import { useChannel } from "@/context/channel_context";
import { useSocketActions } from "@/context/socket_context";

export default function MessageInput() {
  const { user } = useAuth();
  const { currentChannel } = useChannel();
  const { sendMessage } = useSocketActions();

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !currentChannel || !user) return;

    setIsSending(true);
    sendMessage(currentChannel._id, text.trim());
    setText("");
    setIsSending(false);
  };

  if (!currentChannel)
    return (
      <div className="p-4 border-t border-gray-800 text-gray-500 text-center">
        Select a channel to send messages.
      </div>
    );

  return (
    <form
      onSubmit={handleSend}
      className="p-4 border-t border-gray-800 bg-gray-900 flex items-center space-x-2"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Message #${currentChannel.name}`}
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
