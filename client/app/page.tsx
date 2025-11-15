"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth_context";

export default function Home() {
  const router = useRouter();
  const { user, loading , token} = useAuth();
  useEffect(() => {
    if (loading) return;

    if (!user || !token) {
      router.replace("/login");
    } else {
      router.replace("/chat");
    }
  }, [user, loading, token]);

  return null;
}
