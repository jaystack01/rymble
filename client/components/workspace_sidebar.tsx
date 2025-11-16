"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWorkspace } from "@/context/workspace_context";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth_context";

export default function WorkspaceSidebar() {
  const { user } = useAuth();
  // Expecting useWorkspace to provide these. If your context names differ,
  // update them accordingly.
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

  // Track whether user explicitly dismissed the modal so auto-open won't
  // reopen it unexpectedly (prevents "flip-flop" while workspaces load).
  const manualDismissRef = useRef(false);

  // Focus input when modal opens (safely).
  useEffect(() => {
    if (creating) {
      // small delay can help ensure the input is mounted
      const id = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [creating]);

  // Auto-open modal if no workspaces exist, only when loading finished
  // and a user is present. Do not reopen if user dismissed manually.
  useEffect(() => {
    if (
      !manualDismissRef.current && // user hasn't dismissed manually
      !loading && // we're done loading workspaces
      user && // a logged-in user exists
      Array.isArray(workspaces) && // ensure it's an array
      workspaces.length === 0 // truly empty
    ) {
      setCreating(true);
    }
    // Only track dependencies that affect the decision above.
  }, [workspaces, loading, user]);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // be defensive: ensure createWorkspace is callable
      if (typeof createWorkspace !== "function") {
        throw new Error("createWorkspace not available");
      }
      const ws = await createWorkspace(name.trim());
      // If selectWorkspace exists and returned ws is valid, select it.
      if (ws && typeof selectWorkspace === "function") {
        selectWorkspace(ws);
      }
      setName("");
      setCreating(false);
      manualDismissRef.current = false; // reset explicit dismiss
    } catch (err) {
      console.error("Failed to create workspace:", err);
      // consider showing user-facing error UI here
    } finally {
      setIsSubmitting(false);
    }
  }, [name, createWorkspace, selectWorkspace, isSubmitting]);

  // Keyboard handlers for Enter/Escape while modal open
  useEffect(() => {
    if (!creating) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        manualDismissRef.current = true;
        setCreating(false);
        setName("");
      } else if (e.key === "Enter") {
        // Prevent form submission when already submitting
        if (!isSubmitting) {
          handleCreate();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [creating, isSubmitting, handleCreate]);

  return (
    <>
      <aside className="w-20 bg-[#1a1d21] text-white h-screen flex flex-col items-center py-4 border-r border-gray-800">
        <div className="flex-1 flex flex-col items-center gap-4 overflow-y-auto scrollbar-none">
          {Array.isArray(workspaces) &&
            workspaces.map((ws) => (
              <button
                key={ws._id}
                onClick={() => {
                  if (typeof selectWorkspace === "function")
                    selectWorkspace(ws);
                }}
                title={ws.name}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold transition-all",
                  currentWorkspace?._id === ws._id
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700"
                )}
                aria-pressed={currentWorkspace?._id === ws._id}
              >
                {ws.name?.charAt(0)?.toUpperCase() ?? "?"}
              </button>
            ))}

          <button
            onClick={() => {
              manualDismissRef.current = false;
              setCreating(true);
            }}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-800 hover:bg-gray-700 transition-all"
            title="Create new workspace"
            aria-label="Create new workspace"
          >
            <Plus size={20} />
          </button>
        </div>
      </aside>

      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-workspace-title"
        >
          <div className="bg-gray-900 p-8 rounded-md w-[400px] max-w-full flex flex-col gap-4">
            <h2
              id="create-workspace-title"
              className="text-white text-lg font-semibold"
            >
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
              aria-label="Workspace name"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  manualDismissRef.current = true; // user actively cancelled
                  setCreating(false);
                  setName("");
                }}
                className="px-3 py-1 text-gray-400 hover:text-gray-200"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || isSubmitting}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-white disabled:opacity-50"
                type="button"
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
