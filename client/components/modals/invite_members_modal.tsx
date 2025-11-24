"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

interface InviteMembersModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
}

interface SearchUser {
  _id: string;
  username: string;
  avatar: string | null;
}

export default function InviteMembersModal({
  open,
  onClose,
  workspaceId,
}: InviteMembersModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  // Close on ESC key
  useEffect(() => {
    if (!open) return;

    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Search users
  const searchUsers = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/users/search", {
        params: { q: query },
      });

      setResults(res.data || []);
    } catch (err) {
      console.error("Search failed", err);
      toast.error("Failed to search users");
    }
    setLoading(false);
  }, [query]);

  // Debounce search
  useEffect(() => {
    if (!open) return;

    const t = setTimeout(searchUsers, 400);
    return () => clearTimeout(t);
  }, [query, open, searchUsers]);

  // Send invite
  const handleInvite = async (userId: string) => {
    setSending(userId);

    try {
      const res = await api.post("/invites/send", {
        workspaceId,
        receiverId: userId,
      });

      toast.success(res.data?.message || "Invite sent!");
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as {
        response?: { data?: { message?: string } };
      };
      toast.error(apiErr.response?.data?.message || "Failed to send invite");
    }

    setSending(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Invite Members</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery (e.target.value)}
            placeholder="Search by username..."
            className="bg-zinc-800 text-white pr-10"
          />

          {loading && (
            <Loader2
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-zinc-400"
            />
          )}
        </div>

        {/* RESULTS */}
        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
          {!loading && results.length === 0 && query && (
            <p className="text-sm text-zinc-500 text-center py-4">
              No users found
            </p>
          )}

          {!loading &&
            results.map((u) => {
              const avatarSrc =
                u.avatar && u.avatar?.startsWith("http")
                  ? u.avatar
                  : u.avatar
                  ? `/uploads/${u.avatar}`
                  : "/default-avatar.jpg";

              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-2 rounded bg-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarSrc}
                      alt={u.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <p className="text-white text-sm">{u.username}</p>
                  </div>

                  <Button
                    size="sm"
                    disabled={sending === u._id}
                    onClick={() => handleInvite(u._id)}
                  >
                    {sending === u._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Invite"
                    )}
                  </Button>
                </div>
              );
            })}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
