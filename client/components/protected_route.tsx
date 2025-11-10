"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/auth_context";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user === null) {
      // redirect unauthenticated users to login
      router.replace("/login");
    }
  }, [user, loading, router]);

  // show loading while auth is being restored
  if (loading || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
