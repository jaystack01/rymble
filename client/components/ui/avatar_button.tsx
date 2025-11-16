"use client";

import { useAuth } from "@/context/auth_context";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";

export default function AvatarMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const handleProfile = () => router.push("/chat/profile");
  const handleSettings = () => router.push("/chat/settings");
  const handleLogout = () => logout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group">
          <Avatar className="h-12 w-12 border border-white/12 group-hover:border-white/20 transition">
            <AvatarImage
              src={user?.avatar || "/default-avatar.jpg"}
              alt={user?.username}
            />
            <AvatarFallback>
              {user?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Online Status */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-gray-900"></span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="end"
        className="w-56 bg-[#111] border border-white/10 text-white"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm">{user?.username}</span>
            <span className="text-xs text-gray-400">{user?.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          onClick={handleProfile}
          className="cursor-pointer flex items-center gap-2"
        >
          <User size={16} /> Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSettings}
          className="cursor-pointer flex items-center gap-2"
        >
          <Settings size={16} /> Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-400 flex items-center gap-2 focus:text-red-300"
        >
          <LogOut size={16} /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
