export interface Channel {
  _id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
}

export interface Member {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status?: string;
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
