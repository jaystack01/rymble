"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

import { parseFieldError } from "@/utils/error";
import { useAuth } from "@/context/auth_context";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthHeader from "@/components/auth_header";

const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username is too long" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers and underscores",
      }),
    email: z.string().email({ message: "Enter a valid email" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { username: "", email: "", password: "", confirm: "" },
  });

  useEffect(() => {
    if (user) router.replace("/chat");
  }, [user, router]);

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerUser(values.username, values.email, values.password);
      toast.success("Account created");
      router.replace("/chat");
    } catch (err) {
      const parsed = parseFieldError(err);
      if (parsed.field && parsed.field !== "form") {
        setError(parsed.field as keyof RegisterValues, {
          message: parsed.message,
        });
      } else {
        toast.error(parsed.message);
      }
    }
  };

  return (
    <>
      <main className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col">
        <AuthHeader />

        <section className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            {/* Context header */}
            <div className="mb-8 text-center">
              <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Set up a workspace-ready identity in seconds.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Username
                  </label>
                  <Input {...register("username")} autoComplete="username" />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.username.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">
                    This will be visible to other members.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Email
                  </label>
                  <Input {...register("email")} autoComplete="email" />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Password
                  </label>
                  <Input
                    type="password"
                    {...register("password")}
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Confirm password
                  </label>
                  <Input
                    type="password"
                    {...register("confirm")}
                    autoComplete="new-password"
                  />
                  {errors.confirm && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.confirm.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6 border-t border-zinc-800" />

              {/* Secondary actions */}
              <div className="space-y-3 text-center text-sm">
                <p className="text-zinc-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-zinc-200 hover:underline">
                    Sign in
                  </Link>
                </p>

                <p className="text-zinc-500">
                  Just exploring?{" "}
                  <Link
                    href="/demo"
                    className="text-zinc-400 hover:text-zinc-200 transition"
                  >
                    Enter demo workspace
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
