"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/utils/error";
import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  registerUser: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  updateUser: (fields: Partial<User>) => Promise<void>;
  logout: () => void;

  setUser: React.Dispatch<React.SetStateAction<User | null>>;

  updateContext: (
    workspaceId: string,
    contextType: "channel" | "member",
    contextId: string,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Load session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    Promise.resolve().then(() => setToken(storedToken));

    // Fetch fresh user and validate token
    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        logout(); // invalid token
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  const registerUser = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const { data } = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      saveSession(data.user, data.token);
    } catch (err) {
      throw err;      
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data.user, data.token);
    } catch (err) {
      throw err;
    }
  };

  const updateUser = async (fields: Partial<User>) => {
    if (!token) return;

    try {
      const { data } = await api.patch("/auth/me", fields, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      throw err;
    }
  };

  const updateContext = async (
    workspaceId: string,
    contextType: "channel" | "member",
    contextId: string
  ) => {
    if (!token || !user) return;

    // Optimistic client update
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        lastOpened: {
          ...prev.lastOpened,
          [workspaceId]: { type: contextType, id: contextId },
        },
      };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });

    // Sync with DB
    await api.patch(
      "/users/context",
      { workspaceId, contextType, contextId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerUser,
        updateUser,
        logout,
        setUser,
        updateContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
