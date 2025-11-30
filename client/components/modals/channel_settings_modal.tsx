"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit2, Archive as ArchiveIcon, Trash2 } from "lucide-react";
import { useChannel } from "@/context/channel_context";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  channelId: string | null;
  channelName: string | null;
}

export default function ChannelSettingsModal({
  open,
  onOpenChange,
  channelId,
  channelName,
}: Props) {
  const { renameChannel, archiveChannel, deleteChannel } = useChannel();

  const [name, setName] = useState<string>(channelName ?? "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [archived, setArchived] = useState<boolean>(false);

  // Reset local state when modal opens or channel changes
  useEffect(() => {
    if (open) {
      setName(channelName ?? "");
      setConfirmingDelete(false);
      setIsSubmitting(false);
      const id = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, channelId]);

  useEffect(() => {
    setArchived(false); // assume false by default; provider's refresh will show real state
  }, [channelId]);

  const handleRename = useCallback(async () => {
    if (!channelId) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSubmitting(true);
    try {
      await renameChannel(channelId, trimmed);
      toast.success("Channel renamed");
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to rename";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [channelId, name, renameChannel, onOpenChange]);

  const handleArchiveToggle = useCallback(async () => {
    if (!channelId) return;
    setIsSubmitting(true);
    try {
      await archiveChannel(channelId);
      toast.success("Channel archived");
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to archive";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [channelId, archiveChannel, onOpenChange]);

  const handleDelete = useCallback(async () => {
    if (!channelId) return;
    // First click shows confirm UI, second performs delete
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteChannel(channelId);
      toast.success("Channel deleted");
      setConfirmingDelete(false);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [channelId, confirmingDelete, deleteChannel, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Channel Settings</DialogTitle>
        </DialogHeader>

        {/* Name / rename */}
        <div className="mt-2">
          <label className="text-sm text-zinc-400 block mb-2">
            Channel name
          </label>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="channel-name"
              disabled={isSubmitting}
              className="bg-zinc-950 border-zinc-800 text-white"
            />
            <Button
              onClick={handleRename}
              disabled={isSubmitting || name.trim() === ""}
            >
              <Edit2 size={14} className="mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-zinc-800 my-4" />

        {/* Archive */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Archive</div>
            <div className="text-xs text-zinc-500">
              Archive this channel (soft-delete). You can restore later from
              archive view.
            </div>
          </div>

          <Button
            onClick={handleArchiveToggle}
            disabled={isSubmitting}
            className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            <ArchiveIcon className="mr-2" size={14} />
            Archive
          </Button>
        </div>

        <div className="h-px bg-zinc-800 my-4" />

        {/* Delete */}
        <div>
          <div className="text-sm text-rose-400">Delete channel</div>
          <div className="text-xs text-zinc-500 mb-3">
            Permanently delete this channel and its content. This cannot be
            undone.
          </div>

          <div className="flex gap-2">
            <Button
              className={
                confirmingDelete
                  ? "bg-rose-600 hover:bg-rose-500"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              <Trash2 size={14} className="mr-2" />
              {confirmingDelete ? "Confirm delete" : "Delete"}
            </Button>

            {confirmingDelete && (
              <Button
                variant="ghost"
                onClick={() => setConfirmingDelete(false)}
                disabled={isSubmitting}
                className="text-zinc-400"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setConfirmingDelete(false);
              onOpenChange(false);
            }}
            className="text-zinc-400 hover:text-zinc-200"
            disabled={isSubmitting}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
