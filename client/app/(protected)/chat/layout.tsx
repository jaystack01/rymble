"use client";

import WorkspaceSidebar from "@/components/workspace_sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Left global sidebar */}
      <WorkspaceSidebar />

      {/* Right area (each page decides its own structure) */}
      <div className="flex-1 h-full overflow-hidden">{children}</div>
    </div>
  );
}
