"use client";

import ChannelSidebar from "@/components/channel_sidebar";
import ChatWindow from "@/components/chat_window";
import MessageInput from "@/components/message_input";
import { useWorkspace } from "@/context/workspace_context";
import { useChannel } from "@/context/channel_context";
import { useMembers } from "@/context/members_context";

export default function ChatPage() {
  const { currentWorkspace, workspaces } = useWorkspace();
  const { currentChannel } = useChannel();
  const { selectedMember } = useMembers();
  
  if (workspaces.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-500 text-sm">
        No workspaces yet. Create your first one!
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-500 text-sm">
        Select a workspace to continue.
      </div>
    );
  }

  if (!currentChannel && !selectedMember) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-500 text-sm">
        Select a channel or member.
      </div>
    );
  }

  return (
    <div className="flex h-full bg-zinc-950">
      {/* Left sidebar */}
      <ChannelSidebar />

      {/* Right content */}
      <div className="flex flex-col flex-1 h-full overflow-hidden border-l border-zinc-800">
        <ChatWindow />

        {/* Message input */}
        <MessageInput />
      </div>
    </div>
  );
}
