// src/context/channel_context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./auth_context";
import { useWorkspace } from "./workspace_context";
import { Channel } from "@/types/shared";
import {
  fetchChannels,
  createChannelApi,
  renameChannelApi,
  archiveChannelApi,
  deleteChannelApi,
} from "@/lib/api/channels";

interface ChannelContextType {
  channels: Channel[];
  currentChannel: Channel | null;
  loading: boolean;
  refreshChannels: () => Promise<void>;
  createChannel: (name: string) => Promise<Channel>;
  selectChannel: (ch: Channel | null) => Promise<void>;
  renameChannel: (channelId: string, newName: string) => Promise<void>;
  archiveChannel: (channelId: string) => Promise<void>;
  deleteChannel: (channelId: string) => Promise<void>;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider = ({ children }: { children: ReactNode }) => {
  const { token, user, updateContext } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------------------
  // Refresh channels from server
  // ----------------------------------------------------------------------
  const refreshChannels = useCallback(async () => {
    if (!token || !currentWorkspace?._id) {
      setChannels([]);
      setCurrentChannel(null);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchChannels(currentWorkspace._id, token);
      setChannels(data);

      // Keep previously selected channel if it still exists
      if (currentChannel?._id) {
        const found = data.find((c) => c._id === currentChannel._id);
        if (found) {
          setCurrentChannel(found);
          return;
        }
      }

      // Restore last opened channel
      const last = user?.lastOpened?.[currentWorkspace._id];
      if (last?.type === "channel") {
        const found = data.find((c) => c._id === last.id);
        if (found) {
          setCurrentChannel(found);
          return;
        }
      }

      // Default fallback
      setCurrentChannel(data[0] || null);
    } finally {
      setLoading(false);
    }
  }, [token, currentWorkspace?._id, user, currentChannel?._id]);

  useEffect(() => {
    refreshChannels();
  }, [currentWorkspace?._id]);

  // ----------------------------------------------------------------------
  // CRUD actions (optimized to avoid full refresh)
  // ----------------------------------------------------------------------
  const createChannel = async (name: string) => {
    if (!token || !currentWorkspace?._id) {
      throw new Error("Cannot create channel");
    }

    setLoading(true);
    try {
      const created = await createChannelApi(name, currentWorkspace._id, token);
      // Append new channel locally
      setChannels((prev) => [...prev, created]);
      await selectChannel(created);
      return created;
    } finally {
      setLoading(false);
    }
  };

  const selectChannel = async (ch: Channel | null) => {
    setCurrentChannel(ch);
    if (ch?._id && currentWorkspace?._id) {
      await updateContext(currentWorkspace._id, "channel", ch._id);
    }
  };

  const renameChannel = async (channelId: string, newName: string) => {
    if (!token) throw new Error("Unauthorized");
    await renameChannelApi(channelId, newName, token);

    // Update channel locally
    setChannels((prev) =>
      prev.map((c) => (c._id === channelId ? { ...c, name: newName } : c))
    );

    if (currentChannel?._id === channelId) {
      setCurrentChannel((prev) => (prev ? { ...prev, name: newName } : prev));
    }
  };

  const archiveChannel = async (channelId: string) => {
    if (!token) throw new Error("Unauthorized");

    await archiveChannelApi(channelId, token);

    setChannels((prev) =>
      prev.map((c) => (c._id === channelId ? { ...c, archived: true } : c))
    );

    if (currentChannel?._id === channelId) {
      const fallback =
        channels.find((c) => c._id !== channelId && !c.archived) || null;
      setCurrentChannel(fallback);
      if (fallback && currentWorkspace?._id) {
        await updateContext(currentWorkspace._id, "channel", fallback._id);
      }
    }
  };


  const deleteChannel = async (channelId: string) => {
    if (!token) throw new Error("Unauthorized");

    await deleteChannelApi(channelId, token);

    setChannels((prev) => prev.filter((c) => c._id !== channelId));

    // if deleted channel was current, select fallback
    if (currentChannel?._id === channelId) {
      const fallback =
        channels.find((c) => c._id !== channelId && !c.archived) || null;
      
      setCurrentChannel(fallback);
      if (fallback && currentWorkspace?._id) {
        await updateContext(currentWorkspace._id, "channel", fallback._id);
      }
    }
  };


  // ----------------------------------------------------------------------
  return (
    <ChannelContext.Provider
      value={{
        channels,
        currentChannel,
        loading,
        refreshChannels,
        createChannel,
        selectChannel,
        renameChannel,
        archiveChannel,
        deleteChannel,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannel = () => {
  const ctx = useContext(ChannelContext);
  if (!ctx) throw new Error("useChannel must be used within ChannelProvider");
  return ctx;
};
