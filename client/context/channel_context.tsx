"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";
import { useAuth } from "./auth_context";
import { useWorkspace } from "./workspace_context";
import { Channel } from "@/types/shared";

interface ChannelContextType {
  channels: Channel[];
  currentChannel: Channel | null;
  loading: boolean;
  fetchChannels: () => Promise<void>;
  createChannel: (name: string) => Promise<Channel>;
  selectChannel: (ch: Channel | null) => Promise<void>;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider = ({ children }: { children: ReactNode }) => {
  const { token, user, updateContext } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);

  // --------------------------------------
  // Fetch channels for the current workspace
  // --------------------------------------
  const fetchChannels = async () => {
    if (!token || !currentWorkspace?._id) {
      setChannels([]);
      setCurrentChannel(null);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get<Channel[]>(
        `/channels/${currentWorkspace._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChannels(data || []);

      // Restore last opened context
      const last = user?.lastOpened?.[currentWorkspace._id];
      if (last?.type === "channel" && last.id) {
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
  };

  // --------------------------------------
  // Create a new channel
  // --------------------------------------
  const createChannel = async (name: string) => {
    if (!token || !currentWorkspace?._id) {
      throw new Error("Cannot create channel");
    }

    setLoading(true);
    try {
      const { data } = await api.post<Channel>(
        "/channels",
        { name, workspaceId: currentWorkspace._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChannels((prev) => [...prev, data]);
      setCurrentChannel(data);

      // use updateContext()
      await updateContext(currentWorkspace._id, "channel", data._id);

      return data;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // Select channel (or clear it)
  // --------------------------------------
  const selectChannel = async (ch: Channel | null) => {
    setCurrentChannel(ch);

    if (!currentWorkspace?._id) return;
    if (!ch || !ch._id) return;

    // use updateContext()
    await updateContext(currentWorkspace._id, "channel", ch._id);
  };

  // --------------------------------------
  // Refetch when workspace changes
  // --------------------------------------
  useEffect(() => {
    fetchChannels();
  }, [currentWorkspace]);

  return (
    <ChannelContext.Provider
      value={{
        channels,
        currentChannel,
        loading,
        fetchChannels,
        createChannel,
        selectChannel,
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
