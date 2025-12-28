"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useWorkspace } from "@/context/workspace_context";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function CreateWorkspaceModal({ open, onOpenChange }: Props) {
  const { createWorkspace, selectWorkspace } = useWorkspace();

  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto focus
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(id);
    }
  }, [open]);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const ws = await createWorkspace(name.trim());
      if (ws) selectWorkspace(ws);

      setName("");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to create workspace:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, isSubmitting, createWorkspace, selectWorkspace, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
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
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            onClick={() => {
              onOpenChange(false);
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
  );
}
