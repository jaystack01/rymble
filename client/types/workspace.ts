import { Channel, Member } from "./shared";

export interface Workspace {
  _id: string;
  name: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  avatar?: string;
  members: Member[];
  channels: Channel[];
  createdAt: string;
}

export interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (ws: Workspace | null) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  refreshWorkspaces: () => Promise<void>;
  loading: boolean;
}
