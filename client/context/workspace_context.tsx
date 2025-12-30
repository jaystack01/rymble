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

interface Invite {
  _id: string;
  workspaceId?: { name?: string };
  sender?: { username?: string };
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;

  pendingInvitesCount: number;
  refreshInvites: () => Promise<void>;
  pendingInvites: Invite[];

  setCurrentWorkspace: (ws: Workspace | null) => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  selectWorkspace: (ws: Workspace | null) => void;
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
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);


  // -----------------------------------------------------
  // Fetch all workspaces and restore the last selected one
  // -----------------------------------------------------
  const fetchWorkspaces = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const { data } = await api.get<Workspace[]>("/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWorkspaces(data || []);

      const lastWsId = user?.lastWorkspaceId;
      const found = data.find((w) => w._id === lastWsId);

      if (found) {
        setCurrentWorkspace(found);
      } else {
        setCurrentWorkspace(data[0] || null);
      }
    } catch (err) {
      console.error(err);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // Create a workspace & persist selection
  // -----------------------------------------------------
  const createWorkspace = async (name: string): Promise<Workspace> => {
    if (!token) throw new Error("No auth token");

    setLoading(true);
    try {
      const { data } = await api.post(
        "/workspaces",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const ws = data.workspace ?? data;

      fetchWorkspaces();

      // update last workspace
      await updateUser({ lastWorkspaceId: ws._id });

      return ws;
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // Select workspace & persist it
  // -----------------------------------------------------
  const selectWorkspace = async (ws: Workspace | null) => {
    setCurrentWorkspace(ws);

    if (!user || !token) return;

    try {
      await updateUser({
        lastWorkspaceId: ws?._id ?? null,
      });
    } catch (err) {
      console.error("Failed to update lastWorkspaceId", err);
    }
  };


  const fetchInvites = async () => {
    if (!token) return;

    try {
      const res = await api.get("/invites/received", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingInvites(res.data || []);
      setPendingInvitesCount(res.data.length || 0);
    } catch {
      setPendingInvitesCount(0);
    }
  };



  useEffect(() => {
    if (token) {
      fetchWorkspaces();
      fetchInvites();
    }
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
        pendingInvitesCount,
        refreshInvites: fetchInvites,
        pendingInvites,
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
