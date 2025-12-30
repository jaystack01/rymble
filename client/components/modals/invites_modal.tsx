"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";
import { useWorkspace } from "@/context/workspace_context";

interface InvitesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InvitesModal({ open, onClose }: InvitesModalProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const {
    pendingInvites,
    fetchWorkspaces,
    setCurrentWorkspace,
    refreshInvites,
  } = useWorkspace();

  const act = async (inviteId: string, action: "accept" | "decline") => {
    setProcessing(inviteId);

    try {
      const res = await api.post(`/invites/${inviteId}/${action}`);

      // refresh provider state
      await refreshInvites();

      if (action === "accept") {
        await fetchWorkspaces();
        const joined = res.data.workspace;
        if (joined) setCurrentWorkspace(joined);
        onClose();
      }

      toast.success(
        action === "accept" ? "Invite accepted" : "Invite declined"
      );
    } catch {
      toast.error("Failed to process invite");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 text-white max-w-md p-5">
        <DialogHeader>
          <DialogTitle>Invitations</DialogTitle>
        </DialogHeader>

        {pendingInvites.length === 0 ? (
          <p className="text-center text-zinc-500 py-6">No pending invites</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {pendingInvites.map((inv) => (
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
