"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/context/workspace_context";
import { useChannel } from "@/context/channel_context";
import { Plus } from "lucide-react";

const ChannelSidebar: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const { channels, selectChannel, createChannel, currentChannel } =
    useChannel();

  const [newChannelName, setNewChannelName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus input when user starts typing or creation starts
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleCreate = async () => {
    if (!newChannelName.trim() || !currentWorkspace) return;

    setIsCreating(true);

    // optimistic UI
    const optimisticName = newChannelName.trim();

    try {
      const created = await createChannel(currentWorkspace._id, optimisticName);

      setNewChannelName("");

      // Move user to the new channel (context will sync URL)
      await selectChannel(created);
    } catch (err: unknown) {
      console.error(
        "Failed to create channel:",
        err instanceof Error ? err.message : err
      );
    } finally {
      setIsCreating(false);
    }
  };

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
        #{currentWorkspace.name}
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {channels.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-sm">No channels yet</div>
        ) : (
          channels.map((ch) => {
            const isActive = currentChannel?._id === ch._id;

            return (
              <div
                key={ch._id}
                onClick={() => selectChannel(ch)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-800 ${
                  isActive ? "bg-gray-800 font-medium" : ""
                }`}
              >
                # {ch.name}
              </div>
            );
          })
        )}
      </div>

      {/* Create Channel */}
      <div className="p-4 border-t border-gray-800">
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
          className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-medium disabled:opacity-50"
        >
          <Plus size={16} /> Create
        </button>
      </div>
    </aside>
  );
};

export default ChannelSidebar;
