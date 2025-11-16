"use client";

import ChannelSidebar from "@/components/channel_sidebar";
import ChatWindow from "@/components/chat_window";
import MessageInput from "@/components/message_input";
import { useWorkspace } from "@/context/workspace_context";
import { useChannel } from "@/context/channel_context";

export default function ChatPage() {
  const { currentWorkspace, workspaces } = useWorkspace();
  const { currentChannel } = useChannel();

  const isReady = currentWorkspace && currentChannel;

  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 text-sm">
        {workspaces.length
          ? "Loading workspace..."
          : "Create your first workspace!"}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Channel list on the left */}
      <ChannelSidebar />

      {/* Chat window on the right */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatWindow />

        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}
