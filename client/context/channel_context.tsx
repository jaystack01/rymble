"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./auth_context";
import { useWorkspace } from "./workspace_context";
import { useSocket } from "./socket_context";
import api from "@/lib/api";
import { ChannelContextType } from "@/types/channel";
import { Channel, Member } from "@/types/shared";

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const socket = useSocket();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  // Fetch channels for workspace
  const fetchChannels = async () => {
    if (!currentWorkspace?._id || !token) return;
    try {
      const { data } = await api.get<Channel[]>(
        `/channels/${currentWorkspace._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChannels(data);
      setMembers(currentWorkspace.members || []);
    } catch (err) {
      console.error("Error fetching channels:", err);
    }
  };

  // Create a new channel
  const createChannel = async (workspaceId: string, name: string) => {
    if (!token) return;
    try {
      const { data } = await api.post<Channel>(
        `/channels`,
        { workspaceId, name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChannels((prev) => [...prev, data]);
    } catch (err) {
      console.error("Error creating channel:", err);
      throw err;
    }
  };

  // Refresh when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      Promise.resolve().then(fetchChannels);
      Promise.resolve().then(() => setCurrentChannel(null));
    }
  }, [currentWorkspace]);

  // Socket listener for channel creation events
  useEffect(() => {
    if (!socket || !currentWorkspace?._id) return;

    const handleNewChannel = (newChannel: Channel) => {
      if (newChannel.workspaceId === currentWorkspace._id) {
        setChannels((prev) => [...prev, newChannel]);
      }
    };

    socket.on("channel:created", handleNewChannel);

    return () => {
      socket.off("channel:created", handleNewChannel);
    };
  }, [socket, currentWorkspace]);

  const value: ChannelContextType = {
    channels,
    members,
    currentChannel,
    setCurrentChannel,
    fetchChannels,
    createChannel,
  };

  return (
    <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
  );
};

export const useChannel = (): ChannelContextType => {
  const context = useContext(ChannelContext);
  if (!context)
    throw new Error("useChannel must be used within a ChannelProvider");
  return context;
};
