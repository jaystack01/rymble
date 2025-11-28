export interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  role: "owner" | "admin" | "member";

  avatar?: string | null;
  createdAt: string;

  lastWorkspaceId?: string | null;

  lastOpened?: Record<
    string, // workspaceId
    {
      type: "channel" | "member";
      id: string;
    }
  >;
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
