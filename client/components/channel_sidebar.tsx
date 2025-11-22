"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useWorkspace } from "@/context/workspace_context";
import { useChannel } from "@/context/channel_context";
import { useMembers } from "@/context/members_context";
import { usePresence } from "@/context/socket_context";
import { useAuth } from "@/context/auth_context";
import { Plus } from "lucide-react";
import { Channel, Member } from "@/types/shared";

export default function ChannelSidebar() {
  const { currentWorkspace } = useWorkspace();
  const { onlineUsers } = usePresence();
  const { user } = useAuth();

  const { channels, currentChannel, selectChannel, createChannel } =
    useChannel();
  const { members, selectedMember, selectMember } = useMembers();

  const [newChannelName, setNewChannelName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // optional refs to scroll active into view
  const activeChannelRef = useRef<HTMLDivElement | null>(null);
  const activeMemberRef = useRef<HTMLDivElement | null>(null);

  // Autofocus for new channel input
  useEffect(() => {
    if (isCreating && inputRef.current) inputRef.current.focus();
  }, [isCreating]);

  // ---------------------------
  // Compute view mode (DM wins)
  // ---------------------------
  const viewMode = useMemo<"channel" | "dm" | null>(() => {
    if (selectedMember) return "dm";
    if (currentChannel) return "channel";
    return null;
  }, [selectedMember, currentChannel]);

  // Scroll active into view when mode or selected item changes (small UX nicety)
  useEffect(() => {
    if (viewMode === "channel" && activeChannelRef.current) {
      activeChannelRef.current.scrollIntoView({ block: "nearest" });
    } else if (viewMode === "dm" && activeMemberRef.current) {
      activeMemberRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [viewMode, currentChannel?._id, selectedMember?._id]);

  // ---------------------------
  // Handlers (stable with useCallback)
  // ---------------------------
  const handleSelectChannel = useCallback(
    async (ch: Channel) => {
      // Clear DM first, then set channel — await so ordering is predictable
      await selectMember(null);
      await selectChannel(ch);
    },
    [selectMember, selectChannel]
  );

  const handleSelectMember = useCallback(
    async (m: Member) => {
      // Clear channel first, then set member
      await selectChannel(null);
      await selectMember(m);
    },
    [selectChannel, selectMember]
  );

  const handleCreate = useCallback(async () => {
    if (!newChannelName.trim() || !currentWorkspace) return;

    setIsCreating(true);
    try {
      const ch = await createChannel(newChannelName.trim());
      // ensure sidebar selection follows the created channel
      await handleSelectChannel(ch);
      setNewChannelName("");
    } catch (err) {
      console.error("Failed to create channel:", err);
    } finally {
      setIsCreating(false);
    }
  }, [newChannelName, currentWorkspace, createChannel, handleSelectChannel]);

  if (!currentWorkspace) {
    return (
      <aside className="w-64 bg-gray-900 text-gray-400 flex items-center justify-center">
        Select a workspace
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col border-l border-gray-800">
      {/* Workspace Name */}
      <div className="p-4 font-semibold text-lg border-b border-gray-800">
        {currentWorkspace.name}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Channels */}
        <div className="px-4 py-2 text-xs uppercase text-gray-400">
          Channels
        </div>

        {channels.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-sm">No channels yet</div>
        ) : (
          channels.map((ch) => {
            const isActive =
              viewMode === "channel" && currentChannel?._id === ch._id;

            return (
              <div
                key={ch._id}
                ref={isActive ? activeChannelRef : undefined}
                onClick={() => handleSelectChannel(ch)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-800 rounded ${
                  isActive ? "bg-gray-800 font-medium" : ""
                }`}
              >
                # {ch.name}
              </div>
            );
          })
        )}

        {/* Members */}
        <div className="px-4 py-2 mt-4 text-xs uppercase text-gray-400">
          Members
        </div>

        {members.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-sm">No members</div>
        ) : (
          members.map((m) => {
            const active = viewMode === "dm" && selectedMember?._id === m._id;

            return (
              <div
                key={m._id}
                ref={active ? activeMemberRef : undefined}
                onClick={() => handleSelectMember(m)}
                className={`px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-800 rounded ${
                  active ? "bg-gray-800 font-medium" : ""
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    onlineUsers.includes(m._id) ? "bg-green-500" : "bg-gray-600"
                  }`}
                />
                <span>
                  {m.displayName || m.username}
                  {m._id === user?._id && " (You)"}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Create Channel */}
      <div className="p-4 border-t border-gray-800 flex flex-col gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="New channel name"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          disabled={isCreating}
          className="w-full p-2 rounded bg-gray-800 text-sm text-white placeholder-gray-400 outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={isCreating || !newChannelName.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-medium disabled:opacity-50"
        >
          <Plus size={16} /> Create Channel
        </button>
      </div>
    </aside>
  );
}
