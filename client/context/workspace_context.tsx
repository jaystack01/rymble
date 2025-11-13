"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "@/lib/api";
import { useAuth } from "./auth_context";
import { Workspace, WorkspaceContextType } from "@/types/workspace";

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all workspaces user is a part of
  const fetchWorkspaces = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get<Workspace[]>("/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkspaces(data);

      // Auto-select first workspace if none selected
      if (!currentWorkspace && data.length > 0) {
        setCurrentWorkspace(data[0]);
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchWorkspaces();
  }, [token]);

  const createWorkspace = async (name: string): Promise<Workspace> => {
    if (!token) throw new Error("No auth token");
    setLoading(true);
    try {
      const { data } = await api.post<Workspace>(
        "/workspaces",
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWorkspaces((prev) => [...prev, data]);
      setCurrentWorkspace(data);
      return data;
    } catch (err) {
      console.error("Workspace creation failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    await fetchWorkspaces();
  };

  const value: WorkspaceContextType = {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    refreshWorkspaces,
    loading, // added here
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return context;
};
