"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/workspace_context";
import { useChannel } from "@/context/channel_context";
import { Plus } from "lucide-react";

const ChannelSidebar: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const {
    channels,
    currentChannel,
    setCurrentChannel,
    fetchChannels,
    createChannel,
  } = useChannel();

  const [newChannelName, setNewChannelName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch channels when workspace changes
  useEffect(() => {
    if (currentWorkspace) fetchChannels();
  }, [currentWorkspace]);

  const handleCreate = async () => {
    if (!newChannelName.trim() || !currentWorkspace) return;
    setIsCreating(true);
    try {
      await createChannel(currentWorkspace._id, newChannelName.trim());
      setNewChannelName("");
    } catch (err: unknown) {
      console.error(
        "Failed to create channel:",
        err instanceof Error ? err.message : err
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentWorkspace)
    return (
      <aside className="w-64 bg-gray-900 text-gray-400 flex items-center justify-center">
        Select a workspace
      </aside>
    );

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col border-l border-gray-800">
      <div className="p-4 font-semibold text-lg border-b border-gray-800">
        #{currentWorkspace.name}
      </div>

      <div className="flex-1 overflow-y-auto">
        {channels.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-sm">No channels yet</div>
        ) : (
          channels.map((ch) => (
            <div
              key={ch._id}
              onClick={() => setCurrentChannel(ch)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-800 ${
                currentChannel?._id === ch._id ? "bg-gray-800 font-medium" : ""
              }`}
            >
              # {ch.name}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <input
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
