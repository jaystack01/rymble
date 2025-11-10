"use client";
import ProtectedRoute from "@/components/protected_route";
import { useAuth } from "@/context/auth_context";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>Welcome, {user?.username} to your private dashboard!</p>
      </div>
    </ProtectedRoute>
  );
}
