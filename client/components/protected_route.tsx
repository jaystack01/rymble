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
    if (loading || wsLoading) return;

    // Unauthenticated → go to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Authenticated but no workspace → go create one
    if (user && workspaces.length === 0) {
      router.replace("/create-workspace");
      return;
    }

    // Authenticated + has workspace → ensure in chat
    if (user && workspaces.length > 0 && window.location.pathname === "/") {
      const firstWs = workspaces[0];
      router.replace(
        `/chat/${firstWs.name}/${firstWs.channels?.[0]?.name || "general"}`
      );
    }
  }, [user, loading, wsLoading, workspaces, router]);

  if (loading || wsLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
