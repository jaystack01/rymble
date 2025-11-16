"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth_context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    const payload = {
      displayName: displayName.trim(),
      username: username.trim(),
    };

    try {
      setSaving(true);
      await updateUser(payload);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex justify-center pt-16 px-4">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* Display Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Display Name</label>
            <Input
              className="bg-gray-800 border-gray-700"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Username</label>
            <Input
              className="bg-gray-800 border-gray-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email (locked) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Email</label>
            <Input
              disabled
              className="bg-gray-800 border-gray-700 opacity-60"
              value={user?.email}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-500"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
