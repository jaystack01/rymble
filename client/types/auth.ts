export interface User {
  _id: string;
  username: string; // Unique identifier (login identity)
  displayName: string; // Visible name in chat (editable)
  email: string;

  avatar?: string | null; // Default or user-selected avatar
  createdAt: string;

  lastWorkspaceId?: string;
  lastChannelIds?: { [workspaceId: string]: string };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (fields: Partial<User>) => Promise<void>;
}
