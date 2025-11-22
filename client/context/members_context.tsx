"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useWorkspace } from "./workspace_context";
import { useAuth } from "./auth_context";
import api from "@/lib/api";
import { Member } from "@/types/shared";

interface MembersContextType {
  members: Member[];
  loading: boolean;
  selectedMember: Member | null;
  selectMember: (m: Member | null) => Promise<void>;
  refreshMembers: () => Promise<void>;
}

const MembersContext = createContext<MembersContextType | null>(null);

export const MembersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { currentWorkspace } = useWorkspace();
  const { user, updateContext } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // ------------------------------
  // Fetch all members of workspace
  // ------------------------------
  const refreshMembers = async () => {
    if (!currentWorkspace?._id) return;

    setLoading(true);
    try {
      const res = await api.get(`/workspaces/${currentWorkspace._id}/members`);
      setMembers(res.data.members);

      // Restore last opened context
      const last = user?.lastOpened?.[currentWorkspace._id];
      if (last?.type === "member" && last.id) {
        const found = res.data.members.find((m: Member) => m._id === last.id);
        setSelectedMember(found || null);
      } else {
        setSelectedMember(null);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh on workspace switch
  useEffect(() => {
    refreshMembers();
  }, [currentWorkspace?._id]);

  // ------------------------------
  // Select a member
  // ------------------------------
  const selectMember = async (m: Member | null) => {
    setSelectedMember(m);

    if (!currentWorkspace?._id) return;
    if (!m || !m._id) return;

    await updateContext(currentWorkspace._id, "member", m._id);
  };

  return (
    <MembersContext.Provider
      value={{
        members,
        loading,
        selectedMember,
        selectMember,
        refreshMembers,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error("useMembers must be inside <MembersProvider>");
  return ctx;
};
