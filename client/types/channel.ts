import { Channel, Member } from "./shared";

export interface ChannelContextType {
  channels: Channel[];
  members: Member[];
  currentChannel: Channel | null;

  setCurrentChannel: (channel: Channel | null) => void;

  // Correct type
  fetchChannels: () => Promise<void>;

  // Correct type
  createChannel: (workspaceId: string, name: string) => Promise<Channel>;
}
