"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth_context";
import api from "@/lib/api";

export default function DemoPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const startedRef = useRef(false); // ✅ tracks if we already started

  useEffect(() => {
    if (startedRef.current) return; // prevent double call
    startedRef.current = true;

    async function startDemo() {
      try {
        const res = await api.post("/demo");
        const { token } = res.data;

        await loginWithToken(token);
        router.replace("/chat");
      } catch (err) {
        console.error("Failed to start demo:", err);
      }
    }

    startDemo();
  }, [loginWithToken, router]);

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-zinc-400">
        {/* Spinner */}
        <div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin" />

        {/* Optional text */}
        <span className="text-sm tracking-tight">Entering demo workspace</span>
      </div>
    </main>
  );
}
