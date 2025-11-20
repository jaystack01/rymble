"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useWorkspace } from "./workspace_context";
import api from "@/lib/api";

interface Member {
  _id: string;
  username: string;
  email?: string;
  status?: string;
  avatar?: string;
  displayName?: string;
}

interface MembersContextType {
  members: Member[];
  loading: boolean;
  selectedMember: Member | null;
  selectMember: (m: Member) => void;
  refreshMembers: () => Promise<void>;
}

const MembersContext = createContext<MembersContextType | null>(null);

export const MembersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { currentWorkspace } = useWorkspace();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Fetch members of active workspace
  const refreshMembers = async () => {
    if (!currentWorkspace?._id) return;

    setLoading(true);
    try {
      const res = await api.get(
        `/workspaces/${currentWorkspace._id}/members`
      );
      setMembers(res.data.members);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when workspace changes
  useEffect(() => {
    refreshMembers();
    setSelectedMember(null);
  }, [currentWorkspace?._id]);

  const selectMember = (m: Member) => {
    setSelectedMember(m);
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
