"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../lib/api";
import { User, AuthContextType } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const fetchUser = async (jwt: string) => {
    try {
      const { data } = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUser(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>(
      "/auth/login",
      { email, password }
    );
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const { data } = await api.post<{ token: string; user: User }>(
      "/auth/register",
      { username, email, password }
    );
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  // -------------------------------
  // UPDATE USER (new function)
  // -------------------------------
  const updateUser = async (fields: Partial<User>) => {
    if (!token) return;

    const { data } = await api.patch<User>("/users/me", fields, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
