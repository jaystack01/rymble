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
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
      };
      await registerUser(
        payload.username,
        payload.email,
        payload.password
      );
      toast.success("Account created");
      router.replace("/chat");
    } catch (err) {
      const parsed = parseFieldError(err);
      console.log("Parsed error:", parsed);
      if (parsed.field && parsed.field !== "form") {
        // Map 'username'|'email' -> field error
        // register form keys are username,email,password,confirm
        setError(parsed.field as keyof RegisterValues, {
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
        <h2 className="text-2xl font-semibold text-center mb-4">
          Create account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div>
            <label className="text-sm text-gray-300 block mb-1">
              Confirm password
            </label>
            <Input type="password" {...register("confirm")} />
            {errors.confirm && (
              <p className="text-xs text-red-400 mt-1">
                {errors.confirm.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>

          <p className="text-sm text-gray-400 text-center mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-purple-400 underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
