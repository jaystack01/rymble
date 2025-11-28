"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  RefObject,
} from "react";
import { useWorkspace } from "@/context/workspace_context";
import { useChannel } from "@/context/channel_context";
import { useMembers } from "@/context/members_context";
import { usePresence } from "@/context/socket_context";
import { useAuth } from "@/context/auth_context";

import { Plus, Users, Hash, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Channel, Member} from '@/types/shared'
import InviteMembersModal from "@/components/modals/invite_members_modal";
import WorkspaceSettingsModal from "@/components/modals/workspace_settings_modal";

export default function ChannelSidebar() {
  const { currentWorkspace } = useWorkspace();
  const { onlineUsers } = usePresence();
  const { user } = useAuth();

  const { channels, currentChannel, selectChannel, createChannel } =
    useChannel();
  const { members, selectedMember, selectMember } = useMembers();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [newChannelName, setNewChannelName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeChannelRef = useRef<HTMLDivElement | null>(null);
  const activeMemberRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isCreating && inputRef.current) inputRef.current.focus();
  }, [isCreating]);

  const viewMode = useMemo<"dm" | "channel" | null>(() => {
    if (selectedMember) return "dm";
    if (currentChannel) return "channel";
    return null;
  }, [selectedMember, currentChannel]);

  useEffect(() => {
    if (viewMode === "channel") {
      activeChannelRef.current?.scrollIntoView({ block: "nearest" });
    } else if (viewMode === "dm") {
      activeMemberRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [viewMode, currentChannel?._id, selectedMember?._id]);

  const handleSelectChannel = useCallback(
    async (ch: Channel | null) => {
      await selectMember(null);
      await selectChannel(ch);
    },
    [selectMember, selectChannel]
  );

  const handleSelectMember = useCallback(
    async (m: Member | null) => {
      await selectChannel(null);
      await selectMember(m);
    },
    [selectChannel, selectMember]
  );

  const handleCreate = useCallback(async () => {
    if (!newChannelName.trim() || !currentWorkspace) return;
    setIsCreating(true);

    try {
      const ch = await createChannel(newChannelName.trim());
      await handleSelectChannel(ch);
      setNewChannelName("");
    } catch (err) {
      console.error("Failed to create channel:", err);
    } finally {
      setIsCreating(false);
    }
  }, [newChannelName, currentWorkspace, createChannel, handleSelectChannel]);
  console.log('currentWorkspace', currentWorkspace);
  if (!currentWorkspace) {
    return (
      <aside className="w-64 bg-zinc-900 text-zinc-400 flex items-center justify-center">
        Select a workspace
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-zinc-950 border-l border-zinc-800 flex flex-col">
      {/* Workspace Header */}
      <div className="px-4 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white truncate">
          {currentWorkspace.name}
        </h1>

        {currentWorkspace.owner._id === user?._id && (
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400"
          >
            <Settings size={16} />
          </button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {/* Channels */}
        <SectionHeader
          icon={<Hash size={14} />}
          title="Channels"
          action={
            <button
              onClick={() => setIsCreating(true)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400"
            >
              <Plus size={14} />
            </button>
          }
        />

        <div className="px-2 flex flex-col gap-1">
          {channels.length === 0 ? (
            <EmptyItem label="No channels yet" />
          ) : (
            channels.map((ch) => {
              const active =
                viewMode === "channel" && currentChannel?._id === ch._id;
              return (
                <SidebarItem
                  key={ch._id}
                  label={ch.name}
                  icon={<Hash size={14} />}
                  active={active}
                  innerRef={active ? activeChannelRef : undefined}
                  onClick={() => handleSelectChannel(ch)}
                />
              );
            })
          )}

          {/* Inline create channel */}
          {isCreating && (
            <div className="flex items-center gap-2 px-2 py-2">
              <Input
                ref={inputRef}
                placeholder="new-channel"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="bg-zinc-900"
              />
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newChannelName.trim()}
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setNewChannelName("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Members */}
        <SectionHeader
          icon={<Users size={14} />}
          title="Members"
          action={
            <button
              onClick={() => setInviteOpen(true)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400"
            >
              <Plus size={14} />
            </button>
          }
        />

        <div className="px-2 flex flex-col gap-1 mb-4">
          {members.length === 0 ? (
            <EmptyItem label="No members" />
          ) : (
            members.map((m) => {
              const active = viewMode === "dm" && selectedMember?._id === m._id;

              const online = onlineUsers.includes(m._id);

              return (
                <SidebarItem
                  key={m._id}
                  label={m.displayName || m.username}
                  icon={<MessageSquare size={14} />}
                  active={active}
                  online={online}
                  suffix={m._id === user?._id ? "You" : undefined}
                  innerRef={active ? activeMemberRef : undefined}
                  onClick={() => handleSelectMember(m)}
                />
              );
            })
          )}
        </div>
      </ScrollArea>

      <InviteMembersModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        workspaceId={currentWorkspace._id}
      />

      <WorkspaceSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        workspace={currentWorkspace}
      />
    </aside>
  );
}

/* ---------- COMPONENTS ---------- */

function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 text-xs uppercase text-zinc-500 flex items-center justify-between tracking-wider">
      <div className="flex items-center gap-2">
        {icon}
        {title}
      </div>
      {action}
    </div>
  );
}

function SidebarItem({
  label,
  icon,
  active,
  online,
  suffix,
  onClick,
  innerRef,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  online?: boolean;
  suffix?: string;
  innerRef?: RefObject<HTMLDivElement | null>;
  onClick?: () => void;
}) {
  return (
    <div
      ref={innerRef}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all ${
        active ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-800/50"
      }`}
    >
      {online !== undefined && (
        <span
          className={`w-2 h-2 rounded-full ${
            online ? "bg-green-500" : "bg-zinc-600"
          }`}
        />
      )}
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {suffix && <span className="text-xs text-zinc-500">({suffix})</span>}
    </div>
  );
}

function EmptyItem({ label }: { label: string }) {
  return (
    <div className="px-3 py-2 text-sm text-zinc-500 select-none">{label}</div>
  );
}
