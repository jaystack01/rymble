"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useWorkspace } from "@/context/workspace_context";

interface Invite {
  _id: string;
  workspaceId?: { name?: string };
  sender?: { username?: string };
}

interface InvitesModalProps {
  open: boolean;
  onClose: () => void;
  onUpdateCount?: (count: number) => void;
}

export default function InvitesModal({
  open,
  onClose,
  onUpdateCount,
}: InvitesModalProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const { fetchWorkspaces, setCurrentWorkspace } = useWorkspace();

  const loadInvites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Invite[]>("/invites/received");
      const data = res.data || [];
      setInvites(data);
      onUpdateCount?.(data.length);
    } catch (err: unknown) {
      const apiErr = err as AxiosError<{ message?: string }>;
      toast.error(apiErr.response?.data?.message || "Failed to load invites");
    }
    setLoading(false);
  }, [onUpdateCount]);

  // Prevent synchronous state call directly inside the effect
  useEffect(() => {
    if (!open) return;
    Promise.resolve().then(loadInvites);
  }, [open, loadInvites]);

  const act = async (inviteId: string, action: "accept" | "decline") => {
    setProcessing(inviteId);

    try {
      const res = await api.post(`/invites/${inviteId}/${action}`);

      // compute new list
      const updated = invites.filter((i) => i._id !== inviteId);

      // update state safely
      setInvites(updated);

      // update parent safely (NOT inside setState callback)
      onUpdateCount?.(updated.length);

      if (action === "accept") {
        await fetchWorkspaces();
        const joined = res.data.workspace;
        if (joined) setCurrentWorkspace(joined);
        onClose();
      }

      toast.success(
        action === "accept" ? "Invite accepted" : "Invite declined"
      );
    } catch (err) {
      toast.error("Failed to process invite");
    }

    setProcessing(null);
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          bg-zinc-900 
          border border-zinc-800 
          text-white 
          max-w-md 
          p-5 
        "
      >
        <DialogHeader>
          <DialogTitle>Invitations</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-zinc-400" size={24} />
          </div>
        ) : invites.length === 0 ? (
          <p className="text-center text-zinc-500 py-6">No pending invites</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {invites.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium text-white">
                    {inv.workspaceId?.name || "Unnamed Workspace"}
                  </p>
                  {inv.sender?.username && (
                    <p className="text-xs text-zinc-500">
                      Invited by {inv.sender.username}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={processing === inv._id}
                    onClick={() => act(inv._id, "accept")}
                  >
                    {processing === inv._id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      "Accept"
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={processing === inv._id}
                    onClick={() => act(inv._id, "decline")}
                  >
                    {processing === inv._id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      "Decline"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
