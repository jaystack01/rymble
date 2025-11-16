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
  selectChannel: (ch: Channel) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider = ({ children }: { children: ReactNode }) => {
  const { token, user, updateUser } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Fetch channels for workspace
  // -----------------------------
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChannels(data || []);

      // Use last selected channel from user (if exists)
      const lastId = user?.lastChannelIds?.[currentWorkspace._id];
      const found = data.find((c) => c._id === lastId);
      if (found) {
        setCurrentChannel(found);
      } else {
        setCurrentChannel(data[0] || null);
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Create channel
  // -----------------------------
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

      // update lastChannelIds for this workspace
      await updateUser({ lastChannelIds:  {
        [currentWorkspace._id]: data._id,
      } });

      return data;
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Select channel
  // -----------------------------
  const selectChannel = async (ch: Channel) => {
    setCurrentChannel(ch);

    if (!token || !currentWorkspace?._id || !user) return;

    try {
      await updateUser({
        lastChannelIds: {
          [currentWorkspace._id]: ch._id,
        },
      });
    } catch (err) {
      console.error("Failed to update lastChannelIds:", err);
    }
  };

  // -----------------------------
  // Refetch when workspace or user loads
  // -----------------------------
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
