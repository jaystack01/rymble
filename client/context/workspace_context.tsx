// workspace_context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "./auth_context";
import { Workspace } from "@/types/workspace";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  fetchWorkspaces: () => Promise<void>;
  selectWorkspace: (ws: Workspace) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, updateUser } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  // fetch workspaces list
  const fetchWorkspaces = async (): Promise<void> => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get<Workspace[]>("/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkspaces(data || []);
    } catch (err) {
      console.error("Workspace.fetchWorkspaces error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // createWorkspace in context (centralized API call + state update)
  const createWorkspace = async (name: string): Promise<Workspace> => {
    if (!token) throw new Error("No auth token");
    setLoading(true);
    try {
      const { data } = await api.post<Workspace>(
        "/workspaces",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // append to local list
      setWorkspaces((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error("Workspace.createWorkspace error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // USER ACTION: select a workspace (called from UI)
  // This writes URL (source of truth) and persists lastWorkspaceId.
  const selectWorkspace = async (ws: Workspace) => {
    const lastMap = user?.lastChannelIds || {};
    const lastId = lastMap[ws._id];
    let channelName = ws.channels?.[0]?.name || "general";

    if (lastId) {
      const found = ws.channels?.find((c) => c._id === lastId);
      if (found) channelName = found.name;
    }

    await router.push(`/chat/${ws.name}/${channelName}`);

    // optimistic local set (keeps UI snappy)
    setCurrentWorkspace(ws);

    // persist lastWorkspaceId (user action)
    if (user?.lastWorkspaceId !== ws._id) {
      updateUser({ lastWorkspaceId: ws._id }).catch(() =>
        console.warn("Failed to persist lastWorkspaceId")
      );
    }
  };

  // SYNC: pathname -> currentWorkspace
  useEffect(() => {
    if (!workspaces.length) return;

    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 1 && parts[0] === "chat") {
      const pick =
        workspaces.find((w) => w._id === user?.lastWorkspaceId) ||
        workspaces[0];
      const channelName = pick.channels?.[0]?.name || "general";
      router.replace(`/chat/${pick.name}/${channelName}`);
      return;
    }

    const urlWorkspaceName = parts[1];
    if (!urlWorkspaceName) return;

    const foundWs = workspaces.find((w) => w.name === urlWorkspaceName) || null;

    // defer state update to avoid setState-in-effect warnings
    Promise.resolve().then(() => setCurrentWorkspace(foundWs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, workspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        fetchWorkspaces,
        selectWorkspace,
        createWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};
