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

  // Keep form in sync with auth user
  useEffect(() => {
    reset({
      displayName: user?.displayName ?? "",
      username: user?.username ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const watched = watch();
  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      watched.displayName !== (user.displayName ?? "") ||
      watched.username !== user.username
    );
  }, [watched, user]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateUser({
        displayName: values.displayName,
        username: values.username,
      });
      toast.success("Profile updated");
      reset({
        displayName: user?.displayName ?? "",
        username: user?.username,
      });
      // optional: refreshUser?.();
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
    <div className="min-h-[60vh] flex items-start justify-center p-6">
      <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Profile</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1">
              Display name
            </label>
            <Input {...register("displayName")} />
            {errors.displayName && (
              <p className="text-xs text-red-400 mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Username</label>
            <Input {...register("username")} />
            {errors.username && (
              <p className="text-xs text-red-400 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">
              Email (read only)
            </label>
            <Input disabled value={user?.email ?? ""} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
