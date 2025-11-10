"use client";
import { useState } from "react";
import { useSocket } from "@/context/socket_context";

export default function MessageInput({ current_room }) {
  const [text, setText] = useState("");
  const socket = useSocket();

  const sendMessage = () => {
    if (!socket || !text.trim() || !current_room) return;

    socket.emit("send_message", {
      roomId: current_room,
      message: text, // matches server-side handler
    });

    setText("");
  };

  return (
    <div className="p-4 border-t border-gray-700">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="w-full bg-gray-800 p-2 rounded text-white outline-none"
        placeholder="Type your message..."
      />
    </div>
  );
}
