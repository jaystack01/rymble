"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
      <DialogContent className="bg-zinc-900 border border-zinc-800 text-white max-w-lg rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Workspace Settings
          </DialogTitle>
        </DialogHeader>

        {/* Rename Workspace */}
        <section className="mt-4 space-y-2">
          <h4 className="text-sm text-zinc-400 font-medium">
            Rename Workspace
          </h4>
          <div className="flex gap-2">
            <Input
              className="bg-zinc-950 border-zinc-800 text-white flex-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              onClick={handleRename}
              disabled={loading || !name.trim()}
              className="px-4"
            >
              Save
            </Button>
          </div>
        </section>

        {/* Members */}
        <section className="mt-6">
          <h4 className="text-sm text-zinc-400 font-medium mb-2">Members</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {members.map((m: Member) => (
              <div
                key={m._id}
                className="flex items-center justify-between bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-900 transition"
              >
                <span className="text-zinc-300 truncate">
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
        </section>

        {/* Transfer Ownership */}
        <section className="mt-6 space-y-2">
          <h4 className="text-sm text-zinc-400 font-medium">
            Transfer Ownership
          </h4>
          <div className="flex gap-2">
            <select
              className="bg-zinc-950 border border-zinc-800 text-white w-full p-2 rounded-lg"
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
        </section>

        {/* Archived Channels */}
        {archivedChannels.length > 0 && (
          <section className="mt-6">
            <h4 className="text-sm text-zinc-400 font-medium mb-2">
              Archived Channels
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {archivedChannels.map((ch) => (
                <div
                  key={ch._id}
                  className="flex items-center justify-between bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-900 transition"
                >
                  <span className="text-zinc-300 truncate">#{ch.name}</span>
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
          </section>
        )}

        {/* Delete Workspace */}
        <DialogFooter className="mt-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
