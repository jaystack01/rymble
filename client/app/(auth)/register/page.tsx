"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth_context";
import { parseFieldError } from "@/utils/error";

export default function RegisterPage() {
  const { register, user, token } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      // Newly registered users always go to create-workspace
      router.replace("/chat");
    }
  }, [user, token]);


  const update = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    setFieldErrors({ ...fieldErrors, [key]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    if (!form.username || !form.email || !form.password || !form.confirm) {
      setFormError("All fields are required");
      return;
    }

    if (form.password !== form.confirm) {
      setFieldErrors({ confirm: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
    } catch (err) {
      const parsed = parseFieldError(err);
      if (parsed.field === "form") setFormError(parsed.message);
      else setFieldErrors({ [parsed.field]: parsed.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg w-80 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {formError && <p className="text-red-500 text-sm">{formError}</p>}

        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          className="w-full p-2 rounded bg-gray-700"
        />
        {fieldErrors.username && (
          <p className="text-red-500 text-xs">{fieldErrors.username}</p>
        )}

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full p-2 rounded bg-gray-700"
        />
        {fieldErrors.email && (
          <p className="text-red-500 text-xs">{fieldErrors.email}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full p-2 rounded bg-gray-700"
        />
        {fieldErrors.password && (
          <p className="text-red-500 text-xs">{fieldErrors.password}</p>
        )}

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          className="w-full p-2 rounded bg-gray-700"
        />
        {fieldErrors.confirm && (
          <p className="text-red-500 text-xs">{fieldErrors.confirm}</p>
        )}

        <button
          disabled={loading}
          className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
