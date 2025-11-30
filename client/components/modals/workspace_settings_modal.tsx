"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import api from "@/lib/api";
import { Member } from "@/types/shared";
import { Workspace } from "@/types/workspace";
import { useMembers } from "@/context/members_context";
import { useWorkspace } from "@/context/workspace_context";
import { useAuth } from "@/context/auth_context";
import { useChannel } from "@/context/channel_context";

interface Props {
  open: boolean;
  onClose: () => void;
  workspace: Workspace;
}

export default function WorkspaceSettingsModal({
  open,
  onClose,
  workspace,
}: Props) {
  const { members, refreshMembers } = useMembers();
  const { fetchWorkspaces, selectWorkspace } = useWorkspace();
  const { user } = useAuth();
  const { channels, refreshChannels } = useChannel();
  const [name, setName] = useState(workspace.name);
  const [loading, setLoading] = useState(false);
  const [transferTo, setTransferTo] = useState("");

  const archivedChannels = useMemo(
    () => channels.filter((c) => c.archived),
    [channels]
  );

  const handleRename = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      await api.patch(`/workspaces/${workspace._id}`, { name });
      await fetchWorkspaces();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    setLoading(true);
    try {
      await api.delete(`/workspaces/${workspace._id}/members/${memberId}`);
      await fetchWorkspaces();
      await refreshMembers();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo) return;
    setLoading(true);

    try {
      await api.post(`/workspaces/${workspace._id}/transfer-ownership`, {
        newOwnerId: transferTo,
      });

      await fetchWorkspaces();
      await refreshMembers();
      setTransferTo("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/workspaces/${workspace._id}`);
      await fetchWorkspaces();
      selectWorkspace(null);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (channelId: string) => {
    setLoading(true);
    try {
      await api.patch(`/channels/${channelId}`, { archived: false });
      await refreshChannels();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Workspace Settings</DialogTitle>
        </DialogHeader>

        {/* Rename */}
        <div className="space-y-2">
          <h3 className="text-sm text-zinc-400">Rename workspace</h3>
          <Input
            className="bg-zinc-950 border-zinc-800 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            onClick={handleRename}
            disabled={loading || !name.trim()}
            className="w-fit"
          >
            Save
          </Button>
        </div>

        {/* Members */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm text-zinc-400">Members</h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {members.map((m: Member) => (
              <div
                key={m._id}
                className="flex items-center justify-between bg-zinc-950 border border-zinc-800 px-3 py-2 rounded"
              >
                <span className="text-zinc-300">
                  {m.displayName || m.username}
                </span>

                {m._id !== user?._id && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(m._id)}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ownership Transfer */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm text-zinc-400">Transfer Ownership</h3>

          <select
            className="bg-zinc-950 border border-zinc-800 text-white w-full p-2 rounded"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          >
            <option value="">Select member</option>
            {members
              .filter((m) => m._id !== user?._id)
              .map((m) => (
                <option key={m._id} value={m._id}>
                  {m.displayName || m.username}
                </option>
              ))}
          </select>

          <Button
            variant="secondary"
            onClick={handleTransfer}
            disabled={!transferTo || loading}
          >
            Transfer
          </Button>
        </div>

        {/* Archived Channels */}
        {archivedChannels.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm text-zinc-400">Archived Channels</h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {archivedChannels.map((ch) => (
                <div
                  key={ch._id}
                  className="flex items-center justify-between bg-zinc-950 border border-zinc-800 px-3 py-2 rounded"
                >
                  <span className="text-zinc-300">#{ch.name}</span>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleUnarchive(ch._id)}
                    disabled={loading}
                  >
                    Unarchive
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Workspace */}
        <div className="mt-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Workspace
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
