"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSocket } from "@/context/socket_context";
import { useAuth } from "@/context/auth_context";
import api from "@/lib/api";

export default function Sidebar() {
  const router = useRouter();
  const { roomId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();

  const [channels, setChannels] = useState([]);
  const [dms, setDms] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchSidebarData = async () => {
      try {
        const [ch, dm] = await Promise.all([
          api.get("/channels"),
          api.get("/dms"),
        ]);

        if (mounted) {
          setChannels(ch.data);
          setDms(dm.data);
        }
      } catch (e) {
        console.error("Sidebar fetch failed:", e);
      }
    };

    fetchSidebarData();
    return () => {
      mounted = false;
    };
  }, []);

  // Handles joining either a channel or a DM
  const handleJoin = (targetId, isDm = false) => {
    if (!socket) return;

    let targetRoomId = targetId;

    // For DMs, derive a shared deterministic room ID
    if (isDm && user?._id) {
      targetRoomId = [user._id, targetId].sort().join("_");
    }

    socket.emit("join_room", targetRoomId);
    router.push(`/channel/${targetRoomId}`);
  };

  return (
    <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700 flex flex-col">
      {/* Channels Section */}
      <h2 className="text-xl font-bold mb-2">Channels</h2>
      <ul className="space-y-1">
        {channels.map((ch) => (
          <li
            key={ch._id}
            onClick={() => handleJoin(ch._id, false)}
            className={`cursor-pointer p-2 rounded ${
              roomId === ch._id
                ? "bg-gray-700 font-semibold"
                : "hover:bg-gray-700"
            }`}
          >
            #{ch.name}
          </li>
        ))}
      </ul>

      {/* Direct Messages Section */}
      <h2 className="text-xl font-bold mt-5 mb-2">DMs</h2>
      <ul className="space-y-1">
        {dms.map((dm) => (
          <li
            key={dm._id}
            onClick={() => handleJoin(dm._id, true)}
            className={`cursor-pointer p-2 rounded ${
              roomId === [user?._id, dm._id].sort().join("_")
                ? "bg-gray-700 font-semibold"
                : "hover:bg-gray-700"
            }`}
          >
            {dm.username}
          </li>
        ))}
      </ul>
    </aside>
  );
}
