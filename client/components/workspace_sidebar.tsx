"use client";

import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/context/workspace_context";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkspaceSidebar() {
  const { workspaces, currentWorkspace, selectWorkspace, createWorkspace } =
    useWorkspace();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus input when modal opens
  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating]);

  // Auto-open modal if no workspaces exist
  useEffect(() => {
    if (!workspaces.length) setCreating(true);
  }, [workspaces.length]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const ws = await createWorkspace(name.trim());
      selectWorkspace(ws); // just update state
      setName("");
      setCreating(false);
    } catch (err) {
      console.error("Failed to create workspace:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <aside className="w-20 bg-[#1a1d21] text-white h-screen flex flex-col items-center py-4 border-r border-gray-800">
        <div className="flex-1 flex flex-col items-center gap-4 overflow-y-auto scrollbar-none">
          {workspaces.map((ws) => (
            <button
              key={ws._id}
              onClick={() => selectWorkspace(ws)}
              title={ws.name}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold transition-all",
                currentWorkspace?._id === ws._id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              )}
            >
              {ws.name.charAt(0).toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => setCreating(true)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-800 hover:bg-gray-700 transition-all"
            title="Create new workspace"
          >
            <Plus size={20} />
          </button>
        </div>
      </aside>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 p-8 rounded-md w-[400px] max-w-full flex flex-col gap-4">
            <h2 className="text-white text-lg font-semibold">
              Create Workspace
            </h2>
            <input
              ref={inputRef}
              type="text"
              placeholder="Workspace Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded outline-none border border-gray-700"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setCreating(false);
                  setName("");
                }}
                className="px-3 py-1 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || isSubmitting}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-white disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
