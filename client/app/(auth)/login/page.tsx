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

const LoginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (user) router.replace("/chat");
  }, [user, router]);

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      toast.success("Signed in");
      router.replace("/chat");
    } catch (err) {
      const parsed = parseFieldError(err);
      if (parsed.field && parsed.field !== "form") {
        setError(parsed.field as keyof LoginValues, {
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
                Sign in to Rymble
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Access your workspaces and continue your conversations.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    autoComplete="current-password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6 border-t border-zinc-800" />

              {/* Secondary actions */}
              <div className="space-y-3 text-center text-sm">
                <p className="text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-zinc-200 hover:underline"
                  >
                    Create one
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
