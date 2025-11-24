"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useWorkspace } from "@/context/workspace_context";
import { useAuth } from "@/context/auth_context";
import AvatarMenu from "@/components/ui/avatar_button";
import api from "@/lib/api";

import InvitesModal from "@/components/modals/invites_modal";
import CreateWorkspaceModal from "@/components/modals/create_workspace_modal";

export default function WorkspaceSidebar() {
  const { user } = useAuth();
  const { workspaces, currentWorkspace, selectWorkspace } = useWorkspace();

  const [creating, setCreating] = useState(false);
  const [invitesOpen, setInvitesOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // load user invites count
  useEffect(() => {
    async function loadInvites() {
      try {
        const res = await api.get("/invites/received");
        setPendingCount(res.data.length || 0);
      } catch {
        setPendingCount(0);
      }
    }
    loadInvites();
  }, []);

  return (
    <>
      <aside className="w-20 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between items-center py-4">
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-3 mt-2 pb-10">
            {workspaces?.map((ws) => {
              const active = currentWorkspace?._id === ws._id;

              return (
                <button
                  key={ws._id}
                  onClick={() => selectWorkspace(ws)}
                  title={ws.name}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-base font-semibold transition-all",
                    active
                      ? "bg-zinc-800 text-white ring-2 ring-zinc-700"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                  )}
                >
                  {ws.name?.charAt(0)?.toUpperCase() ?? "?"}
                </button>
              );
            })}

            {/* Create new workspace button */}
            <button
              onClick={() => setCreating(true)}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-all"
              title="Create new workspace"
            >
              <Plus size={20} />
            </button>
          </div>
        </ScrollArea>

        {/* Workspace Invites Button */}
        <button
          onClick={() => setInvitesOpen(true)}
          className="
            relative
            w-11 h-11
            rounded-xl
            bg-zinc-900
            hover:bg-zinc-800
            flex items-center justify-center
            transition-all
            text-zinc-300
            shadow-sm
            hover:shadow-md
            mb-5
          "
          title="Workspace Invitations"
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-zinc-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 7l9-4 9 4-9 4-9-4z" />
              <path d="M3 7v10l9 4 9-4V7" />
            </svg>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14m7-7H5" />
            </svg>
          </div>

          {pendingCount > 0 && (
            <span
              className="
                absolute
                -top-1 -right-1
                bg-red-600 text-white 
                text-[10px]
                font-medium
                px-1.5 py-0.5
                rounded-full
                shadow-md
              "
            >
              {pendingCount}
            </span>
          )}
        </button>

        <div className="pb-2">
          <AvatarMenu />
        </div>
      </aside>

      <CreateWorkspaceModal open={creating} onOpenChange={setCreating} />

      <InvitesModal
        open={invitesOpen}
        onClose={() => setInvitesOpen(false)}
        onUpdateCount={setPendingCount}
      />
    </>
  );
}
