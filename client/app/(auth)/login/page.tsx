"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { parseFieldError } from "@/utils/error";
import { useAuth } from "@/context/auth_context";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        // map backend field to form field
        setError(parsed.field as keyof LoginValues, {
          message: parsed.message,
        });
      } else {
        toast.error(parsed.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Sign in</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1">Email</label>
            <Input {...register("email")} />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Password</label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-sm text-gray-400 text-center mt-2">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-purple-400 underline">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
