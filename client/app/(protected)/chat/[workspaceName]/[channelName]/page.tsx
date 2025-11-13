"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkspaceSidebar from "@/components/workspace_sidebar";
import ChannelSidebar from "@/components/channel_sidebar";
import ChatWindow from "@/components/chat_window";
import MessageInput from "@/components/message_input";
import { useChannel } from "@/context/channel_context";
import api from "@/lib/api";
import { useAuth } from "@/context/auth_context";

export default function ChannelPage() {
  const params = useParams();
  const { workspaceName, channelName } = params;
  const { setCurrentChannel } = useChannel();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannel = async () => {
      if (!workspaceName || !channelName || !token) return;

      try {
        const { data } = await api.get(
          `/channels/by-name/${workspaceName}/${channelName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCurrentChannel(data);
      } catch (err) {
        console.error("Error loading channel:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [workspaceName, channelName, token]);

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading channel...
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Left Sidebar - Workspaces */}
      <WorkspaceSidebar />

      {/* Middle Sidebar - Channels */}
      <ChannelSidebar />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-full">
        <ChatWindow />
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}
