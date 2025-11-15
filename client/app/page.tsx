"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth_context";
import api from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { user, loading , token} = useAuth();

  const checkWorkspaces = async () => {
    if (!user || !token) return;

    try {
      const { data } = await api.get("/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.length === 0) {
        router.replace("/create-workspace");
      } else {
        router.replace("/chat");
      }
    } catch (err) {
      console.error("Error checking workspaces:", err);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (user && !loading && token) {
      checkWorkspaces();
    } else {
      router.replace("/login");
    }
  }, [user, loading, router]);

  return null;
}
