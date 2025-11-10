"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [defaultChannelId, setDefaultChannelId] = useState(null);

  useEffect(() => {
    api
      .get("/channels")
      .then((res) => {
        if (res.data.length > 0) {
          setDefaultChannelId(res.data[0]._id); // first channel is default
        }
      })
      .catch(console.error);
  }, []);

  const startChatting = () => {
    if (defaultChannelId) {
      router.push(`/channel/${defaultChannelId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
      <button
        onClick={startChatting}
        disabled={!defaultChannelId}
        className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 transition disabled:opacity-50"
      >
        Start Chatting
      </button>
    </div>
  );
}
