"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { parseFieldError } from "@/utils/error";
import { useAuth } from "@/context/auth_context";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: "Display name cannot be empty" })
    .max(50),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username is too long" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Invalid username" }),
});

type ProfileValues = z.infer<typeof ProfileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      displayName: user?.displayName ?? "",
      username: user?.username ?? "",
    },
  });

  // Sync form with user
  useEffect(() => {
    reset({
      displayName: user?.displayName ?? "",
      username: user?.username ?? "",
    });
  }, [user, reset]);

  const watched = watch();
  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      watched.displayName !== (user.displayName ?? "") ||
      watched.username !== user.username
    );
  }, [watched, user]);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateUser({
        displayName: values.displayName,
        username: values.username,
      });
      toast.success("Profile updated");
      reset({
        displayName: values.displayName,
        username: values.username,
      });
    } catch (err) {
      const parsed = parseFieldError(err);
      if (parsed.field && parsed.field !== "form") {
        setError(parsed.field as keyof ProfileValues, {
          message: parsed.message,
        });
      } else {
        toast.error(parsed.message);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[60vh] flex flex-col items-center p-6 bg-zinc-950 text-zinc-300">
      {/* Back button */}
      <div className="w-full max-w-lg mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={() => router.push("/chat")}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>

      <div className="w-full max-w-lg bg-zinc-900 p-6 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 text-white">Profile</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">
              Display name
            </label>
            <Input
              {...register("displayName")}
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
            />
            {errors.displayName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Username</label>
            <Input
              {...register("username")}
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-zinc-500 block mb-1">
              Email (read only)
            </label>
            <Input
              disabled
              value={user?.email ?? ""}
              className="bg-zinc-800 border-zinc-700 text-zinc-400"
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
