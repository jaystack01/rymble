import Sidebar from "@/components/sidebar";
import ProtectedRoute from "@/components/protected_route";

export const metadata = {
  title: "Rymble | Channel",
};

export default function ChannelLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-900 text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col border-l border-gray-700">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
