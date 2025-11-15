"use client";

import WorkspaceSidebar from "@/components/workspace_sidebar";
import ChannelSidebar from "@/components/channel_sidebar";
import ChatWindow from "@/components/chat_window";
import MessageInput from "@/components/message_input";
import { useChannel } from "@/context/channel_context";

export default function ChannelPage() {
  const { currentChannel } = useChannel();

  if (!currentChannel) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading channel...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <WorkspaceSidebar />
      <ChannelSidebar />
      <div className="flex flex-col flex-1 h-full">
        <ChatWindow />
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}
