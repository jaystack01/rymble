"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useWorkspace } from "@/context/workspace_context";
import { useAuth } from "@/context/auth_context";
import AvatarMenu from "@/components/ui/avatar_button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function WorkspaceSidebar() {
  const { user } = useAuth();
  const {
    workspaces = [],
    currentWorkspace,
    selectWorkspace,
    createWorkspace,
    loading = false,
  } = useWorkspace();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (creating) {
      const id = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(id);
    }
  }, [creating]);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const ws = await createWorkspace(name.trim());
      if (ws) selectWorkspace(ws);
      setName("");
      setCreating(false);
    } catch (err) {
      console.error("Failed to create workspace:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, isSubmitting, createWorkspace, selectWorkspace]);

  return (
    <>
      <aside className="w-20 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between items-center py-4">
        {/* Workspaces List */}
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-3 mt-2 pb-10">
            {workspaces.map((ws) => {
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

        {/* Bottom user avatar */}
        <div className="pb-2">
          <AvatarMenu />
        </div>
      </aside>

      {/* Create Workspace Modal */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Create Workspace</DialogTitle>
          </DialogHeader>

          <Input
            ref={inputRef}
            placeholder="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="bg-zinc-950 border-zinc-800 text-white"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200"
              onClick={() => {
                setCreating(false);
                setName("");
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreate}
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
