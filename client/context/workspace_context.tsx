"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";
import { useAuth } from "./auth_context";
import { Workspace } from "@/types/workspace";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  setCurrentWorkspace: (ws: Workspace | null) => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  selectWorkspace: (ws: Workspace) => void; // ← add this
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { token, user, updateUser } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWorkspaces = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get<Workspace[]>("/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkspaces(data || []);
      setCurrentWorkspace(data[0] || null);
    } catch (err) {
      console.error(err);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace> => {
    if (!token) throw new Error("No auth token");

    setLoading(true);
    try {
      const { data } = await api.post(
        "/workspaces",
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If API returns { workspace: {...}, channels: [...] }
      const ws = data.workspace ?? data;

      setWorkspaces((prev) => [...prev, ws]);
      setCurrentWorkspace(ws);
      return ws;
    } finally {
      setLoading(false);
    }
  };

  const selectWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws);
  };

  useEffect(() => {
    if (token) fetchWorkspaces();
  }, [token]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        setCurrentWorkspace,
        fetchWorkspaces,
        createWorkspace,
        selectWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};
