export interface Channel {
  _id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
  archived: boolean;
}

export interface Member {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status?: string;
  displayName?: string;
}

export interface Message {
  _id: string;
  roomId: string;
  sender: Member;
  text: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}
