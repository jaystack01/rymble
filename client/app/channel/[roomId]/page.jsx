"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import ChatWindow from "@/components/chat_window";
import MessageInput from "@/components/message_input";
import { useSocket } from "@/context/socket_context";

export default function ChannelPage() {
  const { roomId } = useParams();
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("join_room", roomId);
  }, [socket, roomId]);

  return (
    <div className="flex flex-col flex-1">
      <ChatWindow current_room={roomId} />
      <MessageInput current_room={roomId} />
    </div>
  );
}
