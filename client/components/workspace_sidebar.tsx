// WorkspaceSidebar.tsx
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

  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const trimmed = name.trim();
    setIsSubmitting(true);

    try {
      // centralized API call via context
      const created = await createWorkspace(trimmed);

      // navigate to the created workspace (selectWorkspace will push URL and persist)
      await selectWorkspace(created);
      setName("");
      setCreating(false);
    } catch (err) {
      console.error("Failed to create workspace:", err);
      // keep input open so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

        {/* Create button */}
        <button
          onClick={() => setCreating((s) => !s)}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-800 hover:bg-gray-700 transition-all"
          title="Create new workspace"
        >
          <Plus size={20} />
        </button>

        {creating && (
          <div className="mt-2 w-16 flex flex-col items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-16 bg-gray-900 text-white text-xs px-1 py-1 rounded outline-none border border-gray-700"
            />
            <button
              onClick={handleCreate}
              disabled={!name.trim() || isSubmitting}
              className="text-[10px] text-purple-400 mt-1 hover:text-purple-300 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>

            <button
              onClick={() => {
                setCreating(false);
                setName("");
              }}
              className="text-[10px] text-gray-500 mt-1 hover:text-gray-400"
            >
              cancel
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
