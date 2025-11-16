"use client";

import WorkspaceSidebar from "@/components/workspace_sidebar";
import ChannelSidebar from "@/components/channel_sidebar";
import ChatWindow from "@/components/chat_window";
import MessageInput from "@/components/message_input";
import { useWorkspace } from "@/context/workspace_context";
import { useChannel } from "@/context/channel_context";

export default function ChatPage() {
  const { currentWorkspace, workspaces } = useWorkspace();
  const { currentChannel } = useChannel();

  // If no workspace exists, let sidebar modal handle creation
  const isReady = currentWorkspace && currentChannel;

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <WorkspaceSidebar />
      {currentWorkspace && currentChannel && <ChannelSidebar />}
      <div className="flex flex-col flex-1 h-full">
        {isReady ? (
          <>
            <ChatWindow />
            <div className="border-t border-gray-800 p-4 bg-gray-900">
              <MessageInput />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            {workspaces.length
              ? "Loading workspace..."
              : "Create your first workspace!"}
          </div>
        )}
      </div>
    </div>
  );
}
