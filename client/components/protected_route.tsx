"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/auth_context";
import { useWorkspace } from "@/context/workspace_context";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { workspaces, loading: wsLoading } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth + workspaces finished loading
    if (loading || wsLoading) return;

    // Unauthenticated -> login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Authenticated but no workspace -> create one
    if (workspaces.length === 0) {
      router.replace("/create-workspace");
      return;
    }

    // At this point: authenticated + has workspaces
    // Determine the best workspace & channel to route to (respect user prefs)
    const targetWorkspace =
      workspaces.find((w) => w._id === user.lastWorkspaceId) || workspaces[0];

    // Resolve channel name from per-workspace lastChannelIds if possible
    const lastChannelId = user.lastChannelIds?.[targetWorkspace._id];
    const channelFromId = targetWorkspace.channels?.find(
      (c: any) => c._id === lastChannelId
    );
    const channelName =
      (channelFromId && channelFromId.name) ||
      targetWorkspace.channels?.[0]?.name ||
      "general";

    const targetPath = `/chat/${targetWorkspace.name}/${channelName}`;

    // Inspect current path
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const parts = path.split("/").filter(Boolean); // removes leading/trailing empty

    // If at root ("/"), always replace with user's target
    if (path === "/" || path === "") {
      router.replace(targetPath);
      return;
    }

    // If at "/chat" (no workspace/channel) -> redirect to target
    if (parts[0] === "chat" && parts.length === 1) {
      router.replace(targetPath);
      return;
    }

    // If at "/chat/:workspace" (workspace present, channel missing) -> enrich with channel
    if (parts[0] === "chat" && parts.length === 2) {
      const workspaceInUrl = parts[1];
      // If URL workspace exists in our list, prefer restoring that workspace's last channel
      const urlWorkspace = workspaces.find((w) => w.name === workspaceInUrl);
      if (urlWorkspace) {
        const lastIdForUrlWs = user.lastChannelIds?.[urlWorkspace._id];
        const urlWsChannel =
          urlWorkspace.channels?.find((c: any) => c._id === lastIdForUrlWs) ||
          urlWorkspace.channels?.[0];
        const urlChannelName = urlWsChannel?.name || "general";
        const redirectTo = `/chat/${urlWorkspace.name}/${urlChannelName}`;
        if (redirectTo !== path) router.replace(redirectTo);
        return;
      }
      // If workspace in URL is unknown, redirect to our computed target
      router.replace(targetPath);
      return;
    }

    // Otherwise: if URL already contains workspace+channel, leave it be (user navigated explicitly)
  }, [user, loading, wsLoading, workspaces, router]);

  // While loading, render a consistent loader to avoid flicker
  if (loading || wsLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
