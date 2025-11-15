// channel_context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "./auth_context";
import { useWorkspace } from "./workspace_context";
import { Channel, Member } from "@/types/shared";

interface ChannelContextType {
  channels: Channel[];
  members: Member[];
  currentChannel: Channel | null;
  loading: boolean;
  fetchChannels: () => Promise<void>;
  // user action: selects channel (writes URL & persists lastChannelIds)
  selectChannel: (ch: Channel) => Promise<void>;
  createChannel: (workspaceId: string, name: string) => Promise<Channel>;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { token, user, updateUser } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // fetch channels for the given workspace id (void)
  const fetchChannels = async (): Promise<void> => {
    if (!currentWorkspace?._id || !token) {
      setChannels([]);
      setMembers([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get<Channel[]>(
        `/channels/${currentWorkspace._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChannels(data || []);
      setMembers(currentWorkspace.members || []);
    } catch (err) {
      console.error("Channel.fetchChannels error:", err);
      setChannels([]);
      setMembers(currentWorkspace.members || []);
    } finally {
      setLoading(false);
    }
  };

  // create channel for a workspace
  const createChannel = async (
    workspaceId: string,
    name: string
  ): Promise<Channel> => {
    if (!token) throw new Error("No auth token");

    try {
      const { data } = await api.post<Channel>(
        `/channels/${workspaceId}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // update channel list optimistically
      setChannels((prev) => [...prev, data]);

      return data; // caller decides what to do (usually router.push)
    } catch (err) {
      console.error("Channel.createChannel error:", err);
      throw err;
    }
  };

  // user action: click/select channel -> push URL (source of truth) and persist lastChannelIds
  const selectChannel = async (ch: Channel) => {
    if (!currentWorkspace) return;

    const desired = `/chat/${currentWorkspace.name}/${ch.name}`;
    // push URL
    await router.push(desired);

    // optimistic update
    setCurrentChannel(ch);

    // persist lastChannelIds map
    const map = user?.lastChannelIds || {};
    if (map[currentWorkspace._id] !== ch._id) {
      updateUser({
        lastChannelIds: {
          ...map,
          [currentWorkspace._id]: ch._id,
        },
      }).catch(() => console.warn("Failed to persist lastChannelIds"));
    }
  };

  // When workspace changes, load channels (no pushes). URL decides the desired channel.
  useEffect(() => {
    // clear state immediately but deferred to avoid react warning
    if (!currentWorkspace) {
      Promise.resolve().then(() => {
        setChannels([]);
        setMembers([]);
        setCurrentChannel(null);
      });
      return;
    }
    fetchChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace, token]);

  // After channels are loaded, sync channel state from URL (or enrich URL if missing channel)
  useEffect(() => {
    if (!currentWorkspace) return;
    if (!channels.length) return;

    const parts = pathname.split("/").filter(Boolean); // ["chat","workspace","channel"]
    const urlChannelName = parts[2]; // channel in URL

    // 1) If URL already contains a channel and it's valid -> adopt it (URL is source)
    if (urlChannelName) {
      const found = channels.find((c) => c.name === urlChannelName);
      if (found) {
        // defer to avoid "setState in effect" warning
        Promise.resolve().then(() => setCurrentChannel(found));
        // also ensure lastChannelIds reflect this (optional: persist if user typed URL)
        const map = user?.lastChannelIds || {};
        if (map[currentWorkspace._id] !== found._id) {
          updateUser({
            lastChannelIds: {
              ...map,
              [currentWorkspace._id]: found._id,
            },
          }).catch(() =>
            console.warn(
              "Failed to persist lastChannelIds after URL navigation"
            )
          );
        }
        return;
      }
      // if urlChannelName present but invalid for this workspace -> we'll fall through and pick a fallback and replace URL
    }

    // 2) URL missing channel or invalid: prefer user.lastChannelIds for this workspace
    const map = user?.lastChannelIds || {};
    const lastId = map[currentWorkspace._id];
    let resolved = lastId ? channels.find((c) => c._id === lastId) : undefined;

    // 3) fallback to first channel
    if (!resolved) resolved = channels[0];

    if (!resolved) {
      // nothing to do
      return;
    }

    // If the URL doesn't include a valid channel, replace it with resolved channel (enrich incomplete URL)
    const desired = `/chat/${currentWorkspace.name}/${resolved.name}`;
    if (window.location.pathname !== desired) {
      // use replace to avoid stacking history when auto-fixing
      router.replace(desired);
      // set state (deferred)
      Promise.resolve().then(() => setCurrentChannel(resolved));
    } else {
      // already desired; ensure state mirrors it
      Promise.resolve().then(() => setCurrentChannel(resolved));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels, pathname, currentWorkspace]);

  return (
    <ChannelContext.Provider
      value={{
        channels,
        members,
        currentChannel,
        loading,
        fetchChannels,
        selectChannel,
        createChannel,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannel = (): ChannelContextType => {
  const ctx = useContext(ChannelContext);
  if (!ctx) throw new Error("useChannel must be used within ChannelProvider");
  return ctx;
};
