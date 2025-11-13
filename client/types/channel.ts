import { Channel, Member } from "./shared";

export interface ChannelContextType {
  channels: Channel[];
  members: Member[];
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel | null) => void;
  fetchChannels: () => Promise<void>;
  createChannel: (workspaceId: string, name: string) => Promise<void>;
}
