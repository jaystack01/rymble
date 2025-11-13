"use client";

import { useState } from "react";
import { useWorkspace } from "@/context/workspace_context";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils"; // optional helper if you have classNames utility

export default function WorkspaceSidebar() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace } =
    useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await createWorkspace(newName.trim());
      setNewName("");
      setShowInput(false);
    } catch (err) {
      console.error("Failed to create workspace:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <aside className="w-20 bg-[#1a1d21] text-white h-screen flex flex-col items-center py-4 border-r border-gray-800">
      <div className="flex-1 flex flex-col items-center gap-4 overflow-y-auto scrollbar-none">
        {workspaces.map((ws) => (
          <button
            key={ws._id}
            onClick={() => setCurrentWorkspace(ws)}
            title={ws.name}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold transition-all duration-200",
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
          onClick={() => setShowInput(!showInput)}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-800 hover:bg-gray-700 transition-all"
          title="Create new workspace"
        >
          <Plus size={20} />
        </button>

        {showInput && (
          <div className="mt-2 w-16 flex flex-col items-center">
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isCreating}
              className="w-16 bg-gray-900 text-white text-xs px-1 py-0.5 rounded outline-none border border-gray-700"
            />
            <button
              onClick={handleCreate}
              disabled={isCreating || !newName.trim()}
              className="text-[10px] text-purple-400 mt-1 hover:text-purple-300 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
