"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/socket_context";
import api from "@/lib/api";

export default function ChatWindow({ current_room }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!current_room) return;
    let mounted = true;

    (async () => {
      try {
        const res = await api.get(`/messages/${current_room}`);
        if (mounted) setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    })();

    if (socket) {
      socket.emit("join_room", current_room);
      socket.on("receive_message", (msg) => {
        if (msg.roomId === current_room) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    }

    return () => {
      mounted = false;
      if (socket) socket.off("receive_message");
    };
  }, [socket, current_room]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg) => (
        <div key={msg._id} className="bg-gray-800 p-2 rounded">
          <strong>{msg.sender.username}: </strong>
          {msg.text}
        </div>
      ))}
    </div>
  );
}
